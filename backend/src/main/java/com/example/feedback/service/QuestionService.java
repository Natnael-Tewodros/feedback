package com.example.feedback.service;

import com.example.feedback.domain.Choice;
import com.example.feedback.domain.Question;
import com.example.feedback.domain.QuestionType;
import com.example.feedback.dto.QuestionDtos.*;
import com.example.feedback.repository.QuestionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class QuestionService {
    private final QuestionRepository questions;
    private final CurrentUserService currentUser;

    public QuestionService(QuestionRepository questions, CurrentUserService currentUser) {
        this.questions = questions;
        this.currentUser = currentUser;
    }

    public List<QuestionResponse> list() {
        return questions.findByActiveTrueOrderByIdDesc().stream().map(this::toResponse).toList();
    }

    public QuestionResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public QuestionResponse create(QuestionRequest request) {
        Question q = new Question();
        q.setCreatedBy(currentUser.get());
        apply(q, request);
        return toResponse(questions.save(q));
    }

    @Transactional
    public QuestionResponse update(Long id, QuestionRequest request) {
        Question q = find(id);
        q.getChoices().clear();
        apply(q, request);
        return toResponse(q);
    }

    @Transactional
    public void delete(Long id) {
        Question q = find(id);
        q.setActive(false);
    }

    @Transactional
    public QuestionResponse cloneQuestion(Long id) {
        Question source = find(id);
        Question clone = new Question();
        clone.setText(source.getText());
        clone.setType(source.getType());
        clone.setRatingMin(source.getRatingMin());
        clone.setRatingMax(source.getRatingMax());
        clone.setActive(true);
        clone.setCreatedBy(currentUser.get());
        clone.setClonedFromQuestion(source);
        for (Choice c : source.getChoices()) {
            Choice cc = new Choice();
            cc.setQuestion(clone);
            cc.setLabel(c.getLabel());
            cc.setSortOrder(c.getSortOrder());
            cc.setActive(c.isActive());
            clone.getChoices().add(cc);
        }
        return toResponse(questions.save(clone));
    }

    public Question find(Long id) {
        return questions.findById(id).orElseThrow(() -> new EntityNotFoundException("Question not found: " + id));
    }

    private void apply(Question q, QuestionRequest request) {
        q.setText(request.text());
        q.setType(request.type());
        q.setActive(request.active() == null || request.active());
        q.setRatingMin(request.ratingMin());
        q.setRatingMax(request.ratingMax());
        if (request.type() == QuestionType.RATING && (request.ratingMin() == null || request.ratingMax() == null || request.ratingMin() >= request.ratingMax())) {
            throw new IllegalArgumentException("Rating questions require ratingMin < ratingMax");
        }
        if (request.type() == QuestionType.MCQ && (request.choices() == null || request.choices().isEmpty())) {
            throw new IllegalArgumentException("MCQ questions require at least one choice");
        }
        if (request.choices() != null) {
            if (request.type() != QuestionType.MCQ) {
                throw new IllegalArgumentException("Choices are only allowed for MCQ questions");
            }
            List<ChoiceRequest> validChoices = request.choices().stream()
                    .filter(choice -> choice.label() != null && !choice.label().isBlank())
                    .toList();
            if (validChoices.isEmpty()) {
                throw new IllegalArgumentException("MCQ questions require at least one non-empty choice");
            }
            for (int i = 0; i < validChoices.size(); i++) {
                ChoiceRequest choiceRequest = validChoices.get(i);
                Choice c = new Choice();
                c.setQuestion(q);
                c.setLabel(choiceRequest.label());
                c.setSortOrder(choiceRequest.sortOrder() == null ? i : choiceRequest.sortOrder());
                c.setActive(choiceRequest.active() == null || choiceRequest.active());
                q.getChoices().add(c);
            }
        }
    }

    public QuestionResponse toResponse(Question q) {
        return new QuestionResponse(q.getId(), q.getText(), q.getType(), q.getRatingMin(), q.getRatingMax(),
                q.isActive(), q.getClonedFromQuestion() == null ? null : q.getClonedFromQuestion().getId(),
                q.getChoices().stream().map(c -> new ChoiceResponse(c.getId(), c.getLabel(), c.getSortOrder(), c.isActive())).toList());
    }
}
