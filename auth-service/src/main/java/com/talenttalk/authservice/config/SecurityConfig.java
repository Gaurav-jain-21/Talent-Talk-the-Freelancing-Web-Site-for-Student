package com.talenttalk.authservice.config;

import com.talenttalk.authservice.service.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // disable for Postman testing

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/register", "/auth/login").permitAll()
                        .anyRequest().authenticated()
                )

                // Session config: Spring creates a session on login, destroys on logout
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .maximumSessions(1)  // one active session per user
                )

                // What happens on login success/failure
                .formLogin(form -> form.disable())  // we use our own login endpoint

                // What happens on logout
                .logout(logout -> logout
                        .logoutUrl("/auth/logout")
                        .invalidateHttpSession(true)    // destroy session
                        .deleteCookies("JSESSIONID")    // remove cookie from browser
                        .logoutSuccessHandler((req, res, auth) -> {
                            res.setStatus(HttpServletResponse.SC_OK);
                            res.getWriter().write("Logged out successfully");
                        })
                )

                // What happens when not logged in
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.getWriter().write("Please login first");
                        })
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager handles the actual login check
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}