package com.example.feedback.controller;

import com.example.feedback.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class UserController {
    private final UserRepository users;

    public UserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public List<UserSummary> list() {
        return users.findAll().stream()
                .map(u -> new UserSummary(u.getId(), u.getFullName(), u.getEmail(), u.getDepartment()))
                .toList();
    }

    public record UserSummary(Long id, String fullName, String email, String department) {}
}

