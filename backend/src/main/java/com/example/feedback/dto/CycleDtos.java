package com.example.feedback.dto;

import com.example.feedback.domain.AssignmentStatus;
import com.example.feedback.domain.CycleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class CycleDtos {
    public record CycleRequest(
            @NotBlank String title,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            @NotEmpty List<Long> questionIds
    ) {}

    public record CycleResponse(
            Long id,
            String title,
            String description,
            CycleStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Long clonedFromCycleId,
            List<Long> questionIds
    ) {}

    public record SendRequest(@NotNull Long cycleId, @NotEmpty List<Long> userIds) {}
    public record AssignmentResponse(Long id, Long cycleId, String cycleTitle, Long assignedToId, String assignedToName, AssignmentStatus status) {}
    public record CloneCycleRequest(@NotBlank String title, String description, LocalDate startDate, LocalDate endDate) {}
}

