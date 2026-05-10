package com.talenttalk.authservice.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import com.talenttalk.authservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User =
                (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "User not found"));

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        // Return JSON instead of redirect
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("token", token);
        responseBody.put("role", user.getRole().name());
        responseBody.put("userId", user.getId().toString());
        responseBody.put("name", user.getName());
        responseBody.put("email", user.getEmail());
        responseBody.put("imageUrl", user.getImageUrl());

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(
                objectMapper.writeValueAsString(responseBody));
    }
}