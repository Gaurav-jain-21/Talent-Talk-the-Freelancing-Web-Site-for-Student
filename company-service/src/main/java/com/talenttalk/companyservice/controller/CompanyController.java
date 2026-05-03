package com.talenttalk.companyservice.controller;

import com.talenttalk.companyservice.dto.CompanyProfileRequest;
import com.talenttalk.companyservice.entity.CompanyProfile;
import com.talenttalk.companyservice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/profile")
    public ResponseEntity<CompanyProfile> createProfile(
            @RequestBody CompanyProfileRequest request) {
        return ResponseEntity.ok(companyService.createProfile(request));
    }
    @PutMapping("/profile/{userId}")
    public ResponseEntity<CompanyProfile> updateProfile(
            @PathVariable Long userId,
            @RequestBody CompanyProfileRequest request) {
        return ResponseEntity.ok(companyService.updateProfile(userId, request));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<CompanyProfile> getProfile(
            @PathVariable Long userId) {
        return ResponseEntity.ok(companyService.getProfileByUserId(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CompanyProfile>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }
    @GetMapping("/students")
    public ResponseEntity<List<Object>> getAllStudents() {
        return ResponseEntity.ok(companyService.getAllStudents());
    }

    @GetMapping("/students/{userId}")
    public ResponseEntity<Object> getStudentProfile(
            @PathVariable Long userId) {
        return ResponseEntity.ok(companyService.getStudentProfile(userId));
    }


    @GetMapping("/{companyId}/jobs")
    public ResponseEntity<List<Object>> getMyJobs(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(companyService.getMyJobs(companyId));
    }



    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<List<Object>> getApplicants(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(companyService.getApplicants(jobId));
    }


    @PatchMapping("/application/{applicationId}/status")
    public ResponseEntity<Object> updateStatus(
            @PathVariable Long applicationId,
            @RequestParam String status) {
        return ResponseEntity.ok(
                companyService.updateApplicationStatus(applicationId, status));
    }
}