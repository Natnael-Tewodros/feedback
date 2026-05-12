package com.example.feedback.service;

import com.example.feedback.domain.*;
import com.example.feedback.dto.ReportDtos.*;
import com.example.feedback.repository.FeedbackAssignmentRepository;
import com.example.feedback.repository.FeedbackCycleQuestionRepository;
import com.example.feedback.repository.FeedbackCycleRepository;
import com.example.feedback.repository.ResponseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private final FeedbackCycleRepository cycles;
    private final FeedbackCycleQuestionRepository cycleQuestions;
    private final FeedbackAssignmentRepository assignments;
    private final ResponseRepository responses;

    public ReportService(FeedbackCycleRepository cycles, FeedbackCycleQuestionRepository cycleQuestions,
                         FeedbackAssignmentRepository assignments, ResponseRepository responses) {
        this.cycles = cycles;
        this.cycleQuestions = cycleQuestions;
        this.assignments = assignments;
        this.responses = responses;
    }

    public SurveyReportResponse buildCycleReport(Long cycleId, LocalDate dateFrom, LocalDate dateTo) {
        FeedbackCycle cycle = cycles.findById(cycleId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback cycle not found: " + cycleId));
        Instant from = dateFrom == null ? null : dateFrom.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = dateTo == null ? null : dateTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        List<Response> reportResponses = responses.findForCycleReport(cycleId, from, to);
        long totalResponses = assignments.countByCycle_IdAndStatusIn(cycleId, List.of(AssignmentStatus.SUBMITTED, AssignmentStatus.APPROVED));

        List<QuestionReportResponse> questionReports = cycleQuestions.findByCycle_IdOrderBySortOrderAsc(cycleId)
                .stream()
                .map(cq -> buildQuestionReport(cq.getQuestion(), reportResponses))
                .toList();

        return new SurveyReportResponse(cycle.getId(), cycle.getTitle(), cycle.getDescription(), cycle.getStatus(),
                Instant.now(), totalResponses, questionReports);
    }

    private QuestionReportResponse buildQuestionReport(Question question, List<Response> reportResponses) {
        List<Response> questionResponses = reportResponses.stream()
                .filter(response -> response.getQuestion().getId().equals(question.getId()))
                .toList();
        Double averageRating = question.getType() == QuestionType.RATING
                ? questionResponses.stream()
                    .map(Response::getRatingValue)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average()
                    .stream()
                    .boxed()
                    .findFirst()
                    .orElse(null)
                : null;
        Long yesCount = question.getType() == QuestionType.YES_NO
                ? questionResponses.stream().filter(response -> Boolean.TRUE.equals(response.getYesNoValue())).count()
                : null;
        Long noCount = question.getType() == QuestionType.YES_NO
                ? questionResponses.stream().filter(response -> Boolean.FALSE.equals(response.getYesNoValue())).count()
                : null;
        List<ChoiceReportResponse> choices = question.getType() == QuestionType.MCQ
                ? question.getChoices().stream()
                    .map(choice -> new ChoiceReportResponse(choice.getId(), choice.getLabel(),
                            questionResponses.stream()
                                    .filter(response -> response.getChoice() != null && response.getChoice().getId().equals(choice.getId()))
                                    .count()))
                    .toList()
                : List.of();
        List<String> textAnswers = question.getType() == QuestionType.TEXT
                ? questionResponses.stream().map(Response::getAnswerText).filter(answer -> answer != null && !answer.isBlank()).toList()
                : List.of();

        return new QuestionReportResponse(question.getId(), question.getText(), question.getType(),
                questionResponses.size(), averageRating, yesCount, noCount, choices, textAnswers);
    }
}
