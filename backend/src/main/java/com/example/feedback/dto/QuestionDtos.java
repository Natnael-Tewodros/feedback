package com.example.feedback.dto;

import com.example.feedback.domain.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class QuestionDtos {
    public record ChoiceRequest(@NotBlank @Size(max = 500) String label, Integer sortOrder, Boolean active) {}
    public record ChoiceResponse(Long id, String label, int sortOrder, boolean active) {}

    public record QuestionRequest(
            @NotBlank @Size(max = 1000) String text,
            @NotNull QuestionType type,
            Integer ratingMin,
            Integer ratingMax,
            Boolean active,
            List<ChoiceRequest> choices
    ) {}

    public record QuestionResponse(
            Long id,
            String text,
            QuestionType type,
            Integer ratingMin,
            Integer ratingMax,
            boolean active,
            Long clonedFromQuestionId,
            List<ChoiceResponse> choices
    ) {}
}

