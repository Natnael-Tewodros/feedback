package com.example.feedback.repository;

import com.example.feedback.domain.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findByAssignmentId(Long assignmentId);

    @Query("select avg(r.ratingValue) from Response r where r.ratingValue is not null")
    Double averageRating();

    @Query("""
            select r from Response r
            where r.assignment.cycle.id = :cycleId
              and (:dateFrom is null or r.createdAt >= :dateFrom)
              and (:dateTo is null or r.createdAt < :dateTo)
            """)
    List<Response> findForCycleReport(@Param("cycleId") Long cycleId,
                                      @Param("dateFrom") Instant dateFrom,
                                      @Param("dateTo") Instant dateTo);
}
