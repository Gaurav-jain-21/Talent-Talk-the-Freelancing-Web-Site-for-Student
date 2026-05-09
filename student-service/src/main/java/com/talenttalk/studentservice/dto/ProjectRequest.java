package com.talenttalk.studentservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project title cannot be blank")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private String techStack;
    private String projectUrl;
}
