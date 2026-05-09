package com.example.feedback.service;

import com.example.feedback.domain.*;
import com.example.feedback.dto.CycleDtos.*;
import com.example.feedback.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CycleService {
    private final FeedbackCycleRepository cycles;
    private final FeedbackCycleQuestionRepository cycleQuestions;
    private final QuestionRepository questions;
    private final UserRepository users;
    private final FeedbackAssignmentRepository assignments;
    private final NotificationLogRepository notifications;
    private final CurrentUserService currentUser;

    public CycleService(FeedbackCycleRepository cycles, FeedbackCycleQuestionRepository cycleQuestions,
                        QuestionRepository questions, UserRepository users,
                        FeedbackAssignmentRepository assignments, NotificationLogRepository notifications,
                        CurrentUserService currentUser) {
        this.cycles = cycles;
        this.cycleQuestions = cycleQuestions;
        this.questions = questions;
        this.users = users;
        this.assignments = assignments;
        this.notifications = notifications;
        this.currentUser = currentUser;
    }

    public List<CycleResponse> list() {
        return cycles.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CycleResponse create(CycleRequest request) {
        FeedbackCycle cycle = new FeedbackCycle();
        cycle.setTitle(request.title());
        cycle.setDescription(request.description());
        cycle.setStartDate(request.startDate());
        cycle.setEndDate(request.endDate());
        cycle.setCreatedBy(currentUser.get());
        cycles.save(cycle);
        attachQuestions(cycle, request.questionIds());
        return toResponse(cycle);
    }

    @Transactional
    public List<AssignmentResponse> send(SendRequest request) {
        FeedbackCycle cycle = find(request.cycleId());
        if (cycleQuestions.findByCycle_IdOrderBySortOrderAsc(cycle.getId()).isEmpty()) {
            throw new IllegalArgumentException("Cannot send a cycle without questions");
        }
        cycle.setStatus(CycleStatus.SENT);
        User sender = currentUser.get();
        return request.userIds().stream().map(userId -> {
            User recipient = users.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
            FeedbackAssignment assignment = assignments.findByCycle_IdAndAssignedTo_Id(cycle.getId(), recipient.getId()).orElseGet(() -> {
                FeedbackAssignment a = new FeedbackAssignment();
                a.setCycle(cycle);
                a.setAssignedBy(sender);
                a.setAssignedTo(recipient);
                return assignments.save(a);
            });
            NotificationLog log = new NotificationLog();
            log.setAssignment(assignment);
            log.setRecipientEmail(recipient.getEmail());
            log.setSubject("Feedback request: " + cycle.getTitle());
            log.setBody("Please complete feedback assignment #" + assignment.getId() + ".");
            notifications.save(log);
            return toAssignmentResponse(assignment);
        }).toList();
    }

    @Transactional
    public CycleResponse cloneCycle(Long sourceCycleId, CloneCycleRequest request) {
        FeedbackCycle source = find(sourceCycleId);
        FeedbackCycle clone = new FeedbackCycle();
        clone.setTitle(request.title());
        clone.setDescription(request.description());
        clone.setStartDate(request.startDate());
        clone.setEndDate(request.endDate());
        clone.setCreatedBy(currentUser.get());
        clone.setClonedFromCycle(source);
        cycles.save(clone);
        List<Long> sourceQuestionIds = cycleQuestions.findByCycle_IdOrderBySortOrderAsc(source.getId())
                .stream().map(cq -> cq.getQuestion().getId()).toList();
        attachQuestions(clone, sourceQuestionIds);
        return toResponse(clone);
    }

    public FeedbackCycle find(Long id) {
        return cycles.findById(id).orElseThrow(() -> new EntityNotFoundException("Feedback cycle not found: " + id));
    }

    private void attachQuestions(FeedbackCycle cycle, List<Long> questionIds) {
        for (int i = 0; i < questionIds.size(); i++) {
            Long questionId = questionIds.get(i);
            Question q = questions.findById(questionId)
                    .orElseThrow(() -> new EntityNotFoundException("Question not found: " + questionId));
            FeedbackCycleQuestion cq = new FeedbackCycleQuestion();
            cq.setCycle(cycle);
            cq.setQuestion(q);
            cq.setSortOrder(i);
            cycleQuestions.save(cq);
        }
    }

    public CycleResponse toResponse(FeedbackCycle cycle) {
        List<Long> questionIds = cycleQuestions.findByCycle_IdOrderBySortOrderAsc(cycle.getId())
                .stream().map(cq -> cq.getQuestion().getId()).toList();
        return new CycleResponse(cycle.getId(), cycle.getTitle(), cycle.getDescription(), cycle.getStatus(),
                cycle.getStartDate(), cycle.getEndDate(),
                cycle.getClonedFromCycle() == null ? null : cycle.getClonedFromCycle().getId(), questionIds);
    }

    public AssignmentResponse toAssignmentResponse(FeedbackAssignment a) {
        return new AssignmentResponse(a.getId(), a.getCycle().getId(), a.getCycle().getTitle(),
                a.getAssignedTo().getId(), a.getAssignedTo().getFullName(), a.getStatus());
    }
}
