package com.example.feedback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class FeedbackCycleQuestionId implements Serializable {
    @Column(name = "cycle_id")
    private Long cycleId;
    @Column(name = "question_id")
    private Long questionId;

    public FeedbackCycleQuestionId() {}
    public FeedbackCycleQuestionId(Long cycleId, Long questionId) {
        this.cycleId = cycleId;
        this.questionId = questionId;
    }
    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FeedbackCycleQuestionId that)) return false;
        return Objects.equals(cycleId, that.cycleId) && Objects.equals(questionId, that.questionId);
    }
    public int hashCode() { return Objects.hash(cycleId, questionId); }
}

