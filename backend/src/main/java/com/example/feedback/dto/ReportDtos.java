package com.example.feedback.dto;

import com.example.feedback.domain.CycleStatus;
import com.example.feedback.domain.QuestionType;

import java.time.Instant;
import java.util.List;

public class ReportDtos {
    public record SurveyReportResponse(
            Long id,
            String title,
            String description,
            CycleStatus status,
            Instant generatedAt,
            long totalResponses,
            List<QuestionReportResponse> questions
    ) {}

    public record QuestionReportResponse(
            Long questionId,
            String text,
            QuestionType type,
            long responseCount,
            Double averageRating,
            Long yesCount,
            Long noCount,
            List<ChoiceReportResponse> choices,
            List<String> textAnswers
    ) {}

    public record ChoiceReportResponse(Long choiceId, String label, long count) {}
}
