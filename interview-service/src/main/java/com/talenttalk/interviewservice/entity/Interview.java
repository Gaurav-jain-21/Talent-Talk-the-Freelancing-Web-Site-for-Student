package com.talenttalk.interviewservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long jobId;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long companyId;

    private String jobTitle;

    @Column(length = 2000)
    private String jobDescription;

    private String skillsRequired;

    private String studentName;
    private String studentSkills;

    @Column(length = 2000)
    private String studentBio;

    private String studentProjects;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status;

    private LocalDateTime deadline;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private Integer totalScore;
    private String grade;

    @Column(length = 2000)
    private String summary;

    private String recommendation;

    @CreationTimestamp
    private LocalDateTime createdAt;
}