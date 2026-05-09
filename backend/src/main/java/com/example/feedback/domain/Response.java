package com.example.feedback.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "responses")
public class Response {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private FeedbackAssignment assignment;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "choice_id")
    private Choice choice;
    @Lob
    @Column(name = "answer_text")
    private String answerText;
    @Column(name = "rating_value")
    private Integer ratingValue;
    @Column(name = "yes_no_value")
    private Boolean yesNoValue;
    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public FeedbackAssignment getAssignment() { return assignment; }
    public void setAssignment(FeedbackAssignment assignment) { this.assignment = assignment; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public Choice getChoice() { return choice; }
    public void setChoice(Choice choice) { this.choice = choice; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public Integer getRatingValue() { return ratingValue; }
    public void setRatingValue(Integer ratingValue) { this.ratingValue = ratingValue; }
    public Boolean getYesNoValue() { return yesNoValue; }
    public void setYesNoValue(Boolean yesNoValue) { this.yesNoValue = yesNoValue; }
    public Instant getCreatedAt() { return createdAt; }
}

