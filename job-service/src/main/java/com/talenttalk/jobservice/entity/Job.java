package com.talenttalk.jobservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="job")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long companyId;
    private String companyName;
    private String title;
    private String description;
    private String location;
    private String salary;
    private String skillsRequired;
    private String jobType;
    private int openings;
    private LocalDate lastDateToApply;
    @Column(columnDefinition = "boolean default true")
    private Boolean isActive;
    @CreationTimestamp
    private LocalDateTime createdAt;

}
