package com.talenttalk.jobservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="application")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long jobId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    @Enumerated(EnumType.STRING)
    private  ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;


}
