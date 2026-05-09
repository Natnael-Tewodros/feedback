package com.example.feedback.repository;

import com.example.feedback.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByActiveTrueOrderByIdDesc();
}
