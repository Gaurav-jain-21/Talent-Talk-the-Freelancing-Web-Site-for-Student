package com.talenttalk.authservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    private boolean isVerified = false;

    private String verificationToken;
    private String passwordResetOtp;
    private LocalDateTime passwordResetOtpExpiresAt;
    private String provider;
    private String providerId;
    private String imageUrl;
}
