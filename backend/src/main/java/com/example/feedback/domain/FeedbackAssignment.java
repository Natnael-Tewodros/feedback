package com.example.feedback.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "feedback_assignments")
public class FeedbackAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private FeedbackCycle cycle;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to", nullable = false)
    private User assignedTo;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;
    @Enumerated(EnumType.STRING)
    private AssignmentStatus status = AssignmentStatus.PENDING;
    @Column(name = "sent_at", insertable = false, updatable = false)
    private Instant sentAt;
    @Column(name = "submitted_at")
    private Instant submittedAt;

    public Long getId() { return id; }
    public FeedbackCycle getCycle() { return cycle; }
    public void setCycle(FeedbackCycle cycle) { this.cycle = cycle; }
    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }
    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }
    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }
    public Instant getSentAt() { return sentAt; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
}

