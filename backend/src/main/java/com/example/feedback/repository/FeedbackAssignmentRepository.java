package com.example.feedback.repository;

import com.example.feedback.domain.AssignmentStatus;
import com.example.feedback.domain.FeedbackAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackAssignmentRepository extends JpaRepository<FeedbackAssignment, Long> {
    List<FeedbackAssignment> findByAssignedToEmailOrderBySentAtDesc(String email);
    List<FeedbackAssignment> findByStatusOrderBySubmittedAtAsc(AssignmentStatus status);
    Optional<FeedbackAssignment> findByCycle_IdAndAssignedTo_Id(Long cycleId, Long assignedToId);
    long countByCycle_Id(Long cycleId);
    long countByCycle_IdAndStatusIn(Long cycleId, List<AssignmentStatus> statuses);
}
