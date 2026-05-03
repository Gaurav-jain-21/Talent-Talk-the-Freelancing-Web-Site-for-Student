package com.talenttalk.jobservice.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class JobRequest {
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
}
