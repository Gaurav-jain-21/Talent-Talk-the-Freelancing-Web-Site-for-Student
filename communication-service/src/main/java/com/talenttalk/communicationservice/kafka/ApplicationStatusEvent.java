package com.talenttalk.communicationservice.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusEvent {
    private Long applicationId;
    private Long jobId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String jobTitle;
    private String companyName;
    private String status;
}
