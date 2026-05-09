package com.example.feedback.controller;

import com.example.feedback.dto.CycleDtos.*;
import com.example.feedback.service.CycleService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
public class CycleController {
    private final CycleService cycleService;

    public CycleController(CycleService cycleService) {
        this.cycleService = cycleService;
    }

    @GetMapping({"", "/"})
    public List<CycleResponse> list() {
        return cycleService.list();
    }

    @PostMapping({"", "/"})
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public CycleResponse create(@Valid @RequestBody CycleRequest request) {
        return cycleService.create(request);
    }

    @PostMapping({"/send", "/send/"})
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public List<AssignmentResponse> send(@Valid @RequestBody SendRequest request) {
        return cycleService.send(request);
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public CycleResponse cloneCycle(@PathVariable Long id, @Valid @RequestBody CloneCycleRequest request) {
        return cycleService.cloneCycle(id, request);
    }
}
