package com.talenttalk.communicationservice.dto;

import lombok.Data;

@Data
public class EmailRequest {
    private String toEmail;
    private String studentName;
    private String jobTitle;
    private String companyName;
    private String status;
}
