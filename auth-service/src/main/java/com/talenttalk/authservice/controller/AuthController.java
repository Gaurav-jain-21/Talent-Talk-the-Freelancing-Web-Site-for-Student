package com.talenttalk.authservice.controller;

import com.talenttalk.authservice.dto.LoginRequest;
import com.talenttalk.authservice.dto.RegisterRequest;
import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import com.talenttalk.authservice.service.EmailVerificationService;
import com.talenttalk.authservice.util.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid
            @RequestBody RegisterRequest request)
            throws MessagingException {

        // Check email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        // Generate unique verification token
        String verificationToken = UUID.randomUUID().toString();

        // Save user with isVerified = false
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setVerified(false);
        user.setVerificationToken(verificationToken);

        userRepository.save(user);

        // Send verification email
        emailVerificationService.sendVerificationEmail(
                request.getEmail(),
                request.getName(),
                verificationToken
        );

        return ResponseEntity.ok(
                "Registered successfully! " +
                        "Please check your email to verify your account."
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is verified
        if (!user.isVerified()) {
            return ResponseEntity.status(403).body(
                    "Email not verified. " +
                            "Please check your email and verify your account first."
            );
        }

        // Verify credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("userId", user.getId().toString());
        response.put("name", user.getName());

        return ResponseEntity.ok(response);
    }

    // Email verification endpoint
    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(
            @RequestParam String token) {

        // Find user by verification token
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid or expired verification token"
                ));

        // Check already verified
        if (user.isVerified()) {
            return ResponseEntity.ok("Email already verified. You can login.");
        }

        // Mark as verified and clear token
        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(
                "Email verified successfully! You can now login."
        );
    }

    // Resend verification email
    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(
            @RequestParam String email) throws MessagingException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            return ResponseEntity.badRequest()
                    .body("Email already verified");
        }

        // Generate new token
        String newToken = UUID.randomUUID().toString();
        user.setVerificationToken(newToken);
        userRepository.save(user);

        emailVerificationService.sendVerificationEmail(
                user.getEmail(),
                user.getName(),
                newToken
        );

        return ResponseEntity.ok("Verification email resent successfully");
    }

    // Validate token endpoint
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