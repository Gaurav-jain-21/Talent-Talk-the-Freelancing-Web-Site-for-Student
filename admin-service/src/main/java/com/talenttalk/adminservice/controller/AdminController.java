package com.talenttalk.adminservice.controller;

import com.talenttalk.adminservice.dto.DashboardStats;
import com.talenttalk.adminservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/students")
    public ResponseEntity<List<Object>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }


    @GetMapping("/companies")
    public ResponseEntity<List<Object>> getAllCompanies() {
        return ResponseEntity.ok(adminService.getAllCompanies());
    }
    @GetMapping("/jobs")
    public ResponseEntity<List<Object>> getAllJobs() {
        return ResponseEntity.ok(adminService.getAllJobs());
    }
    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<Object>> getApplications(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(adminService.getAllApplications(jobId));
    }



    @GetMapping("/payments/{companyId}")
    public ResponseEntity<List<Object>> getPayments(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(adminService.getAllPayments(companyId));
    }


    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(adminService.deleteJob(jobId));
    }
    @PatchMapping("/jobs/{jobId}/close")
    public ResponseEntity<Object> closeJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(adminService.closeJob(jobId));
    }
}