package com.talenttalk.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDto {
    private String toEmail;
    private String studentName;
    private String jobTitle;
    private String companyName;
    private String status;
}