package com.talenttalk.authservice.controller;

import com.talenttalk.authservice.dto.ChangePasswordRequest;
import com.talenttalk.authservice.dto.ForgotPasswordRequest;
import com.talenttalk.authservice.dto.LoginRequest;
import com.talenttalk.authservice.dto.RegisterRequest;
import com.talenttalk.authservice.dto.ResetPasswordRequest;
import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import com.talenttalk.authservice.service.EmailVerificationService;
import com.talenttalk.authservice.util.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.security.SecureRandom;
import java.time.LocalDateTime;
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
    private static final SecureRandom OTP_RANDOM = new SecureRandom();

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

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request)
            throws MessagingException {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("This account uses Google login. Please continue with Google.");
        }

        String otp = String.valueOf(100000 + OTP_RANDOM.nextInt(900000));
        user.setPasswordResetOtp(passwordEncoder.encode(otp));
        user.setPasswordResetOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailVerificationService.sendPasswordResetOtp(
                user.getEmail(),
                user.getName(),
                otp
        );

        return ResponseEntity.ok("Password reset code sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPasswordResetOtp() == null
                || user.getPasswordResetOtpExpiresAt() == null) {
            return ResponseEntity.badRequest()
                    .body("Please request a password reset code first");
        }

        if (LocalDateTime.now().isAfter(user.getPasswordResetOtpExpiresAt())) {
            user.setPasswordResetOtp(null);
            user.setPasswordResetOtpExpiresAt(null);
            userRepository.save(user);
            return ResponseEntity.badRequest()
                    .body("Password reset code expired");
        }

        if (!passwordEncoder.matches(
                request.getOtp(),
                user.getPasswordResetOtp())) {
            return ResponseEntity.badRequest()
                    .body("Invalid verification code");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetOtp(null);
        user.setPasswordResetOtpExpiresAt(null);
        user.setVerified(true);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully");
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

    @GetMapping("/oauth2/user")
    public ResponseEntity<Map<String, String>> getOAuthUser(
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

    @DeleteMapping("/internal/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long userId,
            @RequestHeader(value = "X-Internal-Service", required = false)
            String internalService) {
        if (!"ADMIN-SERVICE".equals(internalService)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Forbidden");
        }
        userRepository.findById(userId).ifPresent(userRepository::delete);
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/internal/users")
    public ResponseEntity<List<Map<String, Object>>> getUsersByRole(
            @RequestParam String role,
            @RequestHeader(value = "X-Internal-Service", required = false)
            String internalService) {
        if (!"ADMIN-SERVICE".equals(internalService)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() != null
                        && user.getRole().name().equalsIgnoreCase(role))
                .map(user -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id", user.getId());
                    row.put("userId", user.getId());
                    row.put("name", user.getName());
                    row.put("email", user.getEmail());
                    row.put("role", user.getRole().name());
                    row.put("verified", user.isVerified());
                    row.put("profileCompleted", false);
                    return row;
                })
                .toList();

        return ResponseEntity.ok(users);
    }
}
