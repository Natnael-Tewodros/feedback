package com.example.feedback.repository;

import com.example.feedback.domain.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findByAssignmentId(Long assignmentId);

    @Query("select avg(r.ratingValue) from Response r where r.ratingValue is not null")
    Double averageRating();
}

