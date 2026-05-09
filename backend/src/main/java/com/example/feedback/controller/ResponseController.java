package com.example.feedback.controller;

import com.example.feedback.dto.CycleDtos.AssignmentResponse;
import com.example.feedback.dto.ResponseDtos.AnswerResponse;
import com.example.feedback.dto.ResponseDtos.SubmitResponsesRequest;
import com.example.feedback.service.ResponseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responses")
public class ResponseController {
    private final ResponseService responseService;

    public ResponseController(ResponseService responseService) {
        this.responseService = responseService;
    }

    @GetMapping("/my-assignments")
    public List<AssignmentResponse> myAssignments() {
        return responseService.myAssignments();
    }

    @PostMapping({"/assignments/{assignmentId}", "/assignments/{assignmentId}/"})
    public void submit(@PathVariable Long assignmentId, @Valid @RequestBody SubmitResponsesRequest request) {
        responseService.submit(assignmentId, request);
    }

    @GetMapping({"/assignments/{assignmentId}", "/assignments/{assignmentId}/"})
    public List<AnswerResponse> answers(@PathVariable Long assignmentId) {
        return responseService.answers(assignmentId);
    }
}
