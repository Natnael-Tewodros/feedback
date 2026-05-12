package com.example.feedback.controller;

import com.example.feedback.dto.ReportDtos.SurveyReportResponse;
import com.example.feedback.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/{cycleId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public SurveyReportResponse getReport(
            @PathVariable Long cycleId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return reportService.buildCycleReport(cycleId, dateFrom, dateTo);
    }
}
