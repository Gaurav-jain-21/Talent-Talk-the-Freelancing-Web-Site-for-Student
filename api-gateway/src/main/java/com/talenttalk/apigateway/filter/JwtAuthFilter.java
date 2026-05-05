package com.talenttalk.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Date;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String secret;

    private static final List<String> OPEN_ROUTES = List.of(
            "/auth/register",
            "/auth/login",
            "/auth/verify",
            "/auth/resend-verification"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Step 1 — check if open route
        if (isOpenRoute(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 2 — get Authorization header
        String authHeader = request.getHeader("Authorization");

        // Step 3 — check header exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing or invalid Authorization header");
            return;
        }

        // Step 4 — extract token
        String token = authHeader.substring(7);

        // Step 5 — validate token
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Step 6 — check expiry
            if (claims.getExpiration().before(new Date())) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token expired");
                return;
            }

            // Step 7 — add user info as request headers
            // Downstream services read these headers
            request.setAttribute("X-User-Email", claims.getSubject());
            request.setAttribute("X-User-Role", claims.get("role").toString());
            request.setAttribute("X-User-Id", claims.get("userId").toString());

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid token: " + e.getMessage());
        }
    }

    private boolean isOpenRoute(String path) {
        return OPEN_ROUTES.stream()
                .anyMatch(path::startsWith);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}