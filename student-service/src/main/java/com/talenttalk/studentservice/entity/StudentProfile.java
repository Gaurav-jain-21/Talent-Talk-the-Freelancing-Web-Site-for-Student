package com.talenttalk.studentservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_profile")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;                    // lowercase 'id'

    @Column(nullable = false)
    private Long userId;                // Long not String

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String college;
    private String degree;
    private int graduationYear;
    private String bio;

    private String skills;              // "Java, React, MySQL" as plain String

    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;

    @Enumerated(EnumType.STRING)        // stores "AVAILABLE" not 0
    private WorkStatus workStatus;

    @CreationTimestamp                  // auto-filled when record is created
    private LocalDateTime createdAt;

    @UpdateTimestamp                    // auto-filled when record is updated
    private LocalDateTime updatedAt;
}