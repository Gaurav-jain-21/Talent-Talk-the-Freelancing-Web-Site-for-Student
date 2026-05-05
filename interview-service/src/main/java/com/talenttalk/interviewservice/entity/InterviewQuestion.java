package com.talenttalk.interviewservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long interviewId;

    private Integer questionNumber;

    @Column(length = 1000)
    private String question;

    @Column(length = 2000)
    private String expectedAnswer; // AI ideal answer

    @Column(length = 2000)
    private String studentAnswer;

    private Integer score; // 0-10

    @Column(length = 1000)
    private String feedback;
}