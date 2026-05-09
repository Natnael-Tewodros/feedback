package com.example.feedback.dto;

import com.example.feedback.domain.ApprovalStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class ResponseDtos {
    public record AnswerRequest(
            @NotNull Long questionId,
            Long choiceId,
            String answerText,
            Integer ratingValue,
            Boolean yesNoValue
    ) {}

    public record SubmitResponsesRequest(@NotEmpty List<@Valid AnswerRequest> answers) {}
    public record AnswerResponse(Long questionId, String questionText, Long choiceId, String answerText, Integer ratingValue, Boolean yesNoValue) {}
    public record ApprovalRequest(@NotNull ApprovalStatus status, String comments) {}
    public record ApprovalResponse(Long id, Long assignmentId, ApprovalStatus status, String comments) {}
}

