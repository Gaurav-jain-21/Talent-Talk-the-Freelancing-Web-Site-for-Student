package com.talenttalk.interviewservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewRequest {
    private Long jobId;
    private Long studentId;
    private Long companyId;
    private LocalDateTime deadline;
}