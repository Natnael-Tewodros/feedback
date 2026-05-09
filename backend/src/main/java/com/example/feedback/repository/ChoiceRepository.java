package com.example.feedback.repository;

import com.example.feedback.domain.Choice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChoiceRepository extends JpaRepository<Choice, Long> {
    List<Choice> findByQuestionIdOrderBySortOrderAsc(Long questionId);
}

