package com.talenttalk.companyservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CompanyProfileRequest {

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotBlank(message = "Company name cannot be blank")
    @Size(min = 2, max = 100,
            message = "Company name must be 2-100 characters")
    private String companyName;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$",
            message = "Phone must be 10 digits")
    private String phone;

    private String website;
    private String industry;
    private String location;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private String logoUrl;
    private String companySize;

    @Min(value = 1900, message = "Founded year must be after 1900")
    @Max(value = 2026, message = "Founded year cannot be in the future")
    private Integer foundedYear;
}