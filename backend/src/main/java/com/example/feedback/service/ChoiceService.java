package com.example.feedback.service;

import com.example.feedback.domain.Choice;
import com.example.feedback.domain.QuestionType;
import com.example.feedback.dto.QuestionDtos.ChoiceRequest;
import com.example.feedback.dto.QuestionDtos.ChoiceResponse;
import com.example.feedback.repository.ChoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ChoiceService {
    private final ChoiceRepository choices;
    private final QuestionService questionService;

    public ChoiceService(ChoiceRepository choices, QuestionService questionService) {
        this.choices = choices;
        this.questionService = questionService;
    }

    public List<ChoiceResponse> list(Long questionId) {
        return choices.findByQuestionIdOrderBySortOrderAsc(questionId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ChoiceResponse create(Long questionId, ChoiceRequest request) {
        var question = questionService.find(questionId);
        if (question.getType() != QuestionType.MCQ) {
            throw new IllegalArgumentException("Choices can only be added to MCQ questions");
        }
        Choice choice = new Choice();
        choice.setQuestion(question);
        choice.setLabel(request.label());
        choice.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        choice.setActive(request.active() == null || request.active());
        return toResponse(choices.save(choice));
    }

    @Transactional
    public ChoiceResponse update(Long id, ChoiceRequest request) {
        Choice choice = choices.findById(id).orElseThrow(() -> new EntityNotFoundException("Choice not found: " + id));
        choice.setLabel(request.label());
        choice.setSortOrder(request.sortOrder() == null ? choice.getSortOrder() : request.sortOrder());
        choice.setActive(request.active() == null || request.active());
        return toResponse(choice);
    }

    @Transactional
    public void delete(Long id) {
        Choice choice = choices.findById(id).orElseThrow(() -> new EntityNotFoundException("Choice not found: " + id));
        choice.setActive(false);
    }

    private ChoiceResponse toResponse(Choice c) {
        return new ChoiceResponse(c.getId(), c.getLabel(), c.getSortOrder(), c.isActive());
    }
}

