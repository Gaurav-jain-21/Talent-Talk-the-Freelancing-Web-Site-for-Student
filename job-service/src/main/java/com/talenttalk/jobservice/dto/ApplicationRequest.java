package com.talenttalk.jobservice.dto;

import com.talenttalk.jobservice.entity.ApplicationStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationRequest {
    private Long jobId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
}
