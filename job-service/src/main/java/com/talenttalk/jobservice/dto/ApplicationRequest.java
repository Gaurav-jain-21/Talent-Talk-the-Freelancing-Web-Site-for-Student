package com.talenttalk.jobservice.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ApplicationRequest {

    @NotNull(message = "Job ID cannot be null")
    private Long jobId;

    @NotNull(message = "Student ID cannot be null")
    private Long studentId;

    @NotBlank(message = "Student name cannot be blank")
    private String studentName;

    @NotBlank(message = "Student email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String studentEmail;
}