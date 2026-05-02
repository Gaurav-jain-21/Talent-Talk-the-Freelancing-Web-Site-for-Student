package com.talenttalk.studentservice.dto;

import com.talenttalk.studentservice.entity.WorkStatus;
import lombok.Data;

@Data
public class StudentProfileRequest {
    private Long userId;
    private String fullName;
    private String email;

    private String phone;
    private String college;
    private String degree;
    private int graduationYear;
    private String bio;

    private String skills;

    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;
    private WorkStatus workStatus;
}
