package com.example.feedback.dto;

public class DashboardDtos {
    public record DashboardStats(long totalAssignments, long submittedAssignments, double responseRate, Double averageRating) {}
}

