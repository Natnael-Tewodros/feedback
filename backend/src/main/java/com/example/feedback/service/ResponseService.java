package com.example.feedback.service;

import com.example.feedback.domain.*;
import com.example.feedback.dto.CycleDtos.AssignmentResponse;
import com.example.feedback.dto.ResponseDtos.*;
import com.example.feedback.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ResponseService {
    private final FeedbackAssignmentRepository assignments;
    private final FeedbackCycleQuestionRepository cycleQuestions;
    private final QuestionRepository questions;
    private final ChoiceRepository choices;
    private final ResponseRepository responses;
    private final CurrentUserService currentUser;
    private final CycleService cycleService;

    public ResponseService(FeedbackAssignmentRepository assignments, FeedbackCycleQuestionRepository cycleQuestions,
                           QuestionRepository questions, ChoiceRepository choices, ResponseRepository responses,
                           CurrentUserService currentUser, CycleService cycleService) {
        this.assignments = assignments;
        this.cycleQuestions = cycleQuestions;
        this.questions = questions;
        this.choices = choices;
        this.responses = responses;
        this.currentUser = currentUser;
        this.cycleService = cycleService;
    }

    public List<AssignmentResponse> myAssignments() {
        return assignments.findByAssignedToEmailOrderBySentAtDesc(currentUser.get().getEmail()).stream()
                .map(cycleService::toAssignmentResponse).toList();
    }

    @Transactional
    public void submit(Long assignmentId, SubmitResponsesRequest request) {
        FeedbackAssignment assignment = findAssignment(assignmentId);
        if (assignment.getStatus() != AssignmentStatus.PENDING && assignment.getStatus() != AssignmentStatus.REJECTED) {
            throw new IllegalArgumentException("Assignment is not open for submission");
        }
        List<Long> allowedQuestionIds = cycleQuestions.findByCycle_IdOrderBySortOrderAsc(assignment.getCycle().getId())
                .stream().map(cq -> cq.getQuestion().getId()).toList();
        responses.deleteAll(responses.findByAssignmentId(assignmentId));
        for (AnswerRequest answer : request.answers()) {
            if (!allowedQuestionIds.contains(answer.questionId())) {
                throw new IllegalArgumentException("Question is not part of this assignment: " + answer.questionId());
            }
            Question question = questions.findById(answer.questionId()).orElseThrow();
            Response response = new Response();
            response.setAssignment(assignment);
            response.setQuestion(question);
            validateAndApplyAnswer(response, question, answer);
            responses.save(response);
        }
        assignment.setStatus(AssignmentStatus.SUBMITTED);
        assignment.setSubmittedAt(Instant.now());
    }

    public List<AnswerResponse> answers(Long assignmentId) {
        return responses.findByAssignmentId(assignmentId).stream()
                .map(r -> new AnswerResponse(r.getQuestion().getId(), r.getQuestion().getText(),
                        r.getChoice() == null ? null : r.getChoice().getId(), r.getAnswerText(), r.getRatingValue(), r.getYesNoValue()))
                .toList();
    }

    public FeedbackAssignment findAssignment(Long id) {
        return assignments.findById(id).orElseThrow(() -> new EntityNotFoundException("Assignment not found: " + id));
    }

    private void validateAndApplyAnswer(Response response, Question question, AnswerRequest answer) {
        switch (question.getType()) {
            case TEXT -> {
                if (answer.answerText() == null || answer.answerText().isBlank()) throw new IllegalArgumentException("Text answer required");
                response.setAnswerText(answer.answerText());
            }
            case RATING -> {
                if (answer.ratingValue() == null) throw new IllegalArgumentException("Rating value required");
                if (answer.ratingValue() < question.getRatingMin() || answer.ratingValue() > question.getRatingMax()) {
                    throw new IllegalArgumentException("Rating value outside allowed scale");
                }
                response.setRatingValue(answer.ratingValue());
            }
            case YES_NO -> {
                if (answer.yesNoValue() == null) throw new IllegalArgumentException("Yes/no answer required");
                response.setYesNoValue(answer.yesNoValue());
            }
            case MCQ -> {
                if (answer.choiceId() == null) throw new IllegalArgumentException("Choice required");
                Choice choice = choices.findById(answer.choiceId()).orElseThrow(() -> new EntityNotFoundException("Choice not found"));
                if (!choice.getQuestion().getId().equals(question.getId())) throw new IllegalArgumentException("Choice belongs to another question");
                response.setChoice(choice);
            }
        }
    }
}
