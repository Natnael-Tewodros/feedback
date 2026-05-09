package com.example.feedback.repository;

import com.example.feedback.domain.Approval;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
}

