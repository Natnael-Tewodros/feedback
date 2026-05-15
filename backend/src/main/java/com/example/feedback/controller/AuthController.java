package com.example.feedback.controller;

import com.example.feedback.dto.AuthDtos.AuthResponse;
import com.example.feedback.dto.AuthDtos.LoginRequest;
import com.example.feedback.dto.AuthDtos.ChangePasswordRequest;
import com.example.feedback.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        return authService.me(authentication.getName());
    }

    @PutMapping("/change-password")
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
    }
}
