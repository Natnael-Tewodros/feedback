package com.example.feedback.service;

import com.example.feedback.domain.*;
import com.example.feedback.dto.CycleDtos.AssignmentResponse;
import com.example.feedback.dto.ResponseDtos.ApprovalRequest;
import com.example.feedback.dto.ResponseDtos.ApprovalResponse;
import com.example.feedback.repository.ApprovalRepository;
import com.example.feedback.repository.FeedbackAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ApprovalService {
    private final FeedbackAssignmentRepository assignments;
    private final ApprovalRepository approvals;
    private final CurrentUserService currentUser;
    private final CycleService cycleService;

    public ApprovalService(FeedbackAssignmentRepository assignments, ApprovalRepository approvals,
                           CurrentUserService currentUser, CycleService cycleService) {
        this.assignments = assignments;
        this.approvals = approvals;
        this.currentUser = currentUser;
        this.cycleService = cycleService;
    }

    public List<AssignmentResponse> pending() {
        return assignments.findByStatusOrderBySubmittedAtAsc(AssignmentStatus.SUBMITTED).stream()
                .map(cycleService::toAssignmentResponse).toList();
    }

    public List<AssignmentResponse> byStatus(AssignmentStatus status) {
        return assignments.findByStatusOrderBySubmittedAtAsc(status).stream()
                .map(cycleService::toAssignmentResponse).toList();
    }

    @Transactional
    public ApprovalResponse approve(Long assignmentId, ApprovalRequest request) {
        FeedbackAssignment assignment = assignments.findById(assignmentId).orElseThrow();
        if (assignment.getStatus() != AssignmentStatus.SUBMITTED) {
            throw new IllegalArgumentException("Only submitted assignments can be approved or rejected");
        }
        assignment.setStatus(request.status() == ApprovalStatus.APPROVED ? AssignmentStatus.APPROVED : AssignmentStatus.REJECTED);
        Approval approval = new Approval();
        approval.setAssignment(assignment);
        approval.setApprovedBy(currentUser.get());
        approval.setStatus(request.status());
        approval.setComments(request.comments());
        approvals.save(approval);
        return new ApprovalResponse(approval.getId(), assignment.getId(), approval.getStatus(), approval.getComments());
    }
}
