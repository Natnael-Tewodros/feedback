package com.example.feedback.controller;

import com.example.feedback.dto.QuestionDtos.ChoiceRequest;
import com.example.feedback.dto.QuestionDtos.ChoiceResponse;
import com.example.feedback.service.ChoiceService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChoiceController {
    private final ChoiceService choiceService;

    public ChoiceController(ChoiceService choiceService) {
        this.choiceService = choiceService;
    }

    @GetMapping("/questions/{questionId}/choices")
    public List<ChoiceResponse> list(@PathVariable Long questionId) {
        return choiceService.list(questionId);
    }

    @PostMapping("/questions/{questionId}/choices")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ChoiceResponse create(@PathVariable Long questionId, @Valid @RequestBody ChoiceRequest request) {
        return choiceService.create(questionId, request);
    }

    @PutMapping("/choices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ChoiceResponse update(@PathVariable Long id, @Valid @RequestBody ChoiceRequest request) {
        return choiceService.update(id, request);
    }

    @DeleteMapping("/choices/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(@PathVariable Long id) {
        choiceService.delete(id);
    }
}

