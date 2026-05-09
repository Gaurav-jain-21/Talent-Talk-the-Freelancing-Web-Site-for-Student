package com.talenttalk.communicationservice.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EmailRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String toEmail;

    @NotBlank(message = "Student name cannot be blank")
    private String studentName;

    @NotBlank(message = "Job title cannot be blank")
    private String jobTitle;

    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @NotBlank(message = "Status cannot be blank")
    @Pattern(regexp = "SELECTED|REJECTED",
            message = "Status must be SELECTED or REJECTED")
    private String status;
}
