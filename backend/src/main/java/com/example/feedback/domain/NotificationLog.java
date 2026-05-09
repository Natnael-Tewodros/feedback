package com.example.feedback.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notification_logs")
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private FeedbackAssignment assignment;
    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;
    private String subject;
    @Column(length = 2000)
    private String body;
    private String status = "SIMULATED";
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public FeedbackAssignment getAssignment() { return assignment; }
    public void setAssignment(FeedbackAssignment assignment) { this.assignment = assignment; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}

