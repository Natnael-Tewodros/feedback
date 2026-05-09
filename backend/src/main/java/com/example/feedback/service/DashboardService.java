package com.example.feedback.service;

import com.example.feedback.domain.AssignmentStatus;
import com.example.feedback.dto.DashboardDtos.DashboardStats;
import com.example.feedback.repository.FeedbackAssignmentRepository;
import com.example.feedback.repository.ResponseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final FeedbackAssignmentRepository assignments;
    private final ResponseRepository responses;

    public DashboardService(FeedbackAssignmentRepository assignments, ResponseRepository responses) {
        this.assignments = assignments;
        this.responses = responses;
    }

    public DashboardStats stats(Long cycleId) {
        long total = cycleId == null ? assignments.count() : assignments.countByCycle_Id(cycleId);
        long submitted = cycleId == null
                ? assignments.findAll().stream().filter(a -> a.getStatus() == AssignmentStatus.SUBMITTED || a.getStatus() == AssignmentStatus.APPROVED).count()
                : assignments.countByCycle_IdAndStatusIn(cycleId, List.of(AssignmentStatus.SUBMITTED, AssignmentStatus.APPROVED));
        double responseRate = total == 0 ? 0 : (submitted * 100.0 / total);
        return new DashboardStats(total, submitted, responseRate, responses.averageRating());
    }
}
