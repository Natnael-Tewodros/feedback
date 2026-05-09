package com.example.feedback.controller;

import com.example.feedback.dto.QuestionDtos.QuestionRequest;
import com.example.feedback.dto.QuestionDtos.QuestionResponse;
import com.example.feedback.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<QuestionResponse> list() {
        return questionService.list();
    }

    @GetMapping("/{id}")
    public QuestionResponse get(@PathVariable Long id) {
        return questionService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse create(@Valid @RequestBody QuestionRequest request) {
        return questionService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse update(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        return questionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public void delete(@PathVariable Long id) {
        questionService.delete(id);
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public QuestionResponse cloneQuestion(@PathVariable Long id) {
        return questionService.cloneQuestion(id);
    }
}

