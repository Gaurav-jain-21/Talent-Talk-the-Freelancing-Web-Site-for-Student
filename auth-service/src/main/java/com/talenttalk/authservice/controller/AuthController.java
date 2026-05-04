package com.talenttalk.authservice.controller;

import com.talenttalk.authservice.dto.LoginRequest;
import com.talenttalk.authservice.dto.RegisterRequest;
import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import com.talenttalk.authservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);
        return ResponseEntity.ok("Registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest request) {

        // Step 1 — verify credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Step 2 — get user from DB to get userId
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Step 3 — generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        // Step 4 — return token + user info
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("userId", user.getId().toString());
        response.put("name", user.getName());

        return ResponseEntity.ok(response);
    }

    // Validate token — other services can call this
    @GetMapping("/validate")
    public ResponseEntity<Map<String, String>> validate(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            return ResponseEntity.status(401).build();
        }

        Map<String, String> response = new HashMap<>();
        response.put("email", jwtUtil.extractEmail(token));
        response.put("role", jwtUtil.extractRole(token));
        response.put("userId", jwtUtil.extractUserId(token).toString());

        return ResponseEntity.ok(response);
    }
}