package com.example.feedback.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "approvals")
public class Approval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private FeedbackAssignment assignment;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by", nullable = false)
    private User approvedBy;
    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;
    private String comments;
    @Column(name = "approved_at", insertable = false, updatable = false)
    private Instant approvedAt;

    public Long getId() { return id; }
    public FeedbackAssignment getAssignment() { return assignment; }
    public void setAssignment(FeedbackAssignment assignment) { this.assignment = assignment; }
    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }
    public ApprovalStatus getStatus() { return status; }
    public void setStatus(ApprovalStatus status) { this.status = status; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Instant getApprovedAt() { return approvedAt; }
}

