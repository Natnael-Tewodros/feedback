package com.example.feedback.repository;

import com.example.feedback.domain.FeedbackCycle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackCycleRepository extends JpaRepository<FeedbackCycle, Long> {
}

