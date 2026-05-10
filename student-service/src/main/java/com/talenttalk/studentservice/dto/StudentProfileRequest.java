package com.talenttalk.studentservice.dto;


import com.talenttalk.studentservice.entity.WorkStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StudentProfileRequest {


    private Long userId;

    @NotBlank(message = "Full name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    private String fullName;

    @Email(message = "Must be a valid email address")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$",
            message = "Phone must be 10 digits")
    private String phone;

    private String college;
    private String degree;

    @Min(value = 2000, message = "Graduation year must be after 2000")
    @Max(value = 2030, message = "Graduation year must be before 2030")
    private int graduationYear;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    private String skills;
    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;
    private WorkStatus workStatus;
}
