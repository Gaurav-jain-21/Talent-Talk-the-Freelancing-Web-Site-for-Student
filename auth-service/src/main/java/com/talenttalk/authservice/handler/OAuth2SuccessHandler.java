package com.talenttalk.authservice.handler;

import com.talenttalk.authservice.entity.User;
import com.talenttalk.authservice.repository.UserRepository;
import com.talenttalk.authservice.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${app.oauth.redirect-url}")
    private String redirectUrl;

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

        String callbackUrl = UriComponentsBuilder
                .fromUriString(redirectUrl)
                .path("/oauth2/callback")
                .queryParam("token", token)
                .queryParam("role", user.getRole().name())
                .queryParam("userId", user.getId())
                .queryParam("name", user.getName())
                .queryParam("email", user.getEmail())
                .queryParam("imageUrl", user.getImageUrl())
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, callbackUrl);
    }
}
