package com.example.feedback.controller;

import com.example.feedback.dto.DashboardDtos.DashboardStats;
import com.example.feedback.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardStats stats(@RequestParam(required = false) Long cycleId) {
        return dashboardService.stats(cycleId);
    }
}

