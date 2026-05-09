package com.talenttalk.jobservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class JobRequest {

    @NotNull(message = "Company ID cannot be null")
    private Long companyId;

    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @NotBlank(message = "Job title cannot be blank")
    @Size(min = 3, max = 100,
            message = "Title must be 3-100 characters")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    @Size(min = 20, message = "Description must be at least 20 characters")
    private String description;

    @NotBlank(message = "Location cannot be blank")
    private String location;

    private String salary;

    @NotBlank(message = "Skills required cannot be blank")
    private String skillsRequired;

    private String jobType;

    @Min(value = 1, message = "Openings must be at least 1")
    @Max(value = 100, message = "Openings cannot exceed 100")
    private int openings;

    @NotNull(message = "Last date to apply cannot be null")
    @Future(message = "Last date must be in the future")
    private LocalDate lastDateToApply;
}
