package com.example.feedback.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback_cycle_questions")
public class FeedbackCycleQuestion {
    @EmbeddedId
    private FeedbackCycleQuestionId id = new FeedbackCycleQuestionId();
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cycleId")
    @JoinColumn(name = "cycle_id")
    private FeedbackCycle cycle;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("questionId")
    @JoinColumn(name = "question_id")
    private Question question;
    @Column(name = "sort_order")
    private int sortOrder;

    public FeedbackCycleQuestionId getId() { return id; }
    public FeedbackCycle getCycle() { return cycle; }
    public void setCycle(FeedbackCycle cycle) { this.cycle = cycle; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}

