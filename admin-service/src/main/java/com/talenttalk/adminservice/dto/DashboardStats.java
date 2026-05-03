package com.talenttalk.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private int totalStudents;
    private int totalCompanies;
    private int totalJobs;
    private int totalApplications;
    private String serviceStatus;
}
