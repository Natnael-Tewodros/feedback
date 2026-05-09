package com.example.feedback.controller;

import com.example.feedback.domain.AssignmentStatus;
import com.example.feedback.dto.CycleDtos.AssignmentResponse;
import com.example.feedback.dto.ResponseDtos.ApprovalRequest;
import com.example.feedback.dto.ResponseDtos.ApprovalResponse;
import com.example.feedback.service.ApprovalService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class ApprovalController {
    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/pending")
    public List<AssignmentResponse> pending() {
        return approvalService.pending();
    }

    @GetMapping
    public List<AssignmentResponse> byStatus(@RequestParam(defaultValue = "SUBMITTED") AssignmentStatus status) {
        return approvalService.byStatus(status);
    }

    @PostMapping({"/assignments/{assignmentId}", "/assignments/{assignmentId}/"})
    public ApprovalResponse approve(@PathVariable Long assignmentId, @Valid @RequestBody ApprovalRequest request) {
        return approvalService.approve(assignmentId, request);
    }
}
