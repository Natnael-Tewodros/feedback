package com.example.feedback.service;

import com.example.feedback.dto.AuthDtos.AuthResponse;
import com.example.feedback.dto.AuthDtos.LoginRequest;
import com.example.feedback.repository.UserRepository;
import com.example.feedback.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.feedback.dto.AuthDtos.ChangePasswordRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, UserRepository users, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        var user = users.findByEmail(request.email()).orElseThrow(() -> new EntityNotFoundException("User not found"));
        var roles = user.getRoles().stream().map(role -> role.getName().name()).toList();
        return new AuthResponse(jwtService.generate(user.getEmail(), roles), user.getId(), user.getFullName(), user.getEmail(), roles);
    }

    public AuthResponse me(String email) {
        var user = users.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found"));
        var roles = user.getRoles().stream().map(role -> role.getName().name()).toList();
        return new AuthResponse(null, user.getId(), user.getFullName(), user.getEmail(), roles);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        var user = users.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        users.save(user);
    }
}
