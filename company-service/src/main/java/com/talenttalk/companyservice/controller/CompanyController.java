package com.talenttalk.companyservice.controller;

import com.talenttalk.companyservice.dto.CompanyProfileRequest;
import com.talenttalk.companyservice.dto.EmailRequestDto;
import com.talenttalk.companyservice.dto.PaymentRequestDto;
import com.talenttalk.companyservice.entity.CompanyProfile;
import com.talenttalk.companyservice.service.CompanyService;
import jakarta.validation.Valid;
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
            @Valid @RequestBody CompanyProfileRequest request) {
        return ResponseEntity.ok(companyService.createProfile(request));
    }
    @PutMapping("/profile/{userId}")
    public ResponseEntity<CompanyProfile> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody CompanyProfileRequest request) {
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

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteCompany(@PathVariable Long userId) {
        companyService.deleteProfile(userId);
        return ResponseEntity.ok("Company deleted successfully");
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

    @PatchMapping("/application/{applicationId}/work-status")
    public ResponseEntity<Object> updateWorkStatus(
            @PathVariable Long applicationId,
            @RequestParam String workStatus) {
        return ResponseEntity.ok(
                companyService.updateWorkStatus(applicationId, workStatus));
    }

    @PostMapping("/application/{applicationId}/work-status")
    public ResponseEntity<Object> updateWorkStatusPost(
            @PathVariable Long applicationId,
            @RequestParam String workStatus) {
        return ResponseEntity.ok(
                companyService.updateWorkStatus(applicationId, workStatus));
    }

    @PostMapping("/email/send")
    public ResponseEntity<String> sendEmail(
            @RequestBody EmailRequestDto request) {
        return ResponseEntity.ok(
                companyService.sendStatusEmail(
                        request.getToEmail(),
                        request.getStudentName(),
                        request.getJobTitle(),
                        request.getCompanyName(),
                        request.getStatus()
                )
        );
    }


    @PostMapping("/payment/create")
    public ResponseEntity<Object> createPayment(
            @RequestBody PaymentRequestDto request) {
        return ResponseEntity.ok(
                companyService.createPayment(
                        request.getCompanyId(),
                        request.getJobId(),
                        request.getStudentId(),
                        request.getAmount()
                )
        );
    }

    @GetMapping("/{companyId}/payments")
    public ResponseEntity<Object> getPayments(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(
                companyService.getPaymentHistory(companyId));
    }
}
