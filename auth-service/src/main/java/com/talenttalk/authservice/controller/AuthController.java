package com.talenttalk.authservice.controller;

import com.talenttalk.authservice.dto.LoginRequest;
import com.talenttalk.authservice.dto.RegisterRequest;
import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
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
    public ResponseEntity<String> login(@RequestBody LoginRequest request,
                                        HttpServletRequest httpRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );

        return ResponseEntity.ok("Login successful. Role: " +
                authentication.getAuthorities());
    }

    @GetMapping("/me")
    public ResponseEntity<String> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok("Logged in as: " + auth.getName() +
                " | Role: " + auth.getAuthorities());
    }
}