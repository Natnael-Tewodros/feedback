package com.example.feedback.repository;

import com.example.feedback.domain.FeedbackCycleQuestion;
import com.example.feedback.domain.FeedbackCycleQuestionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackCycleQuestionRepository extends JpaRepository<FeedbackCycleQuestion, FeedbackCycleQuestionId> {
    List<FeedbackCycleQuestion> findByCycle_IdOrderBySortOrderAsc(Long cycleId);
}
