package com.talenttalk.authservice.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2FailureHandler
        extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException {

        getRedirectStrategy().sendRedirect(
                request,
                response,
                UriComponentsBuilder.fromUriString(redirectUrl)
                        .path("/oauth2/callback")
                        .queryParam("error", "oauth_failed")
                        .queryParam("message", exception.getMessage())
                        .build()
                        .toUriString()
        );
    }
}
