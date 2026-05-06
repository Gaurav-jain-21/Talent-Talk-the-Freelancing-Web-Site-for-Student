package com.talenttalk.jobservice.controller;

import com.talenttalk.jobservice.dto.ApplicationRequest;
import com.talenttalk.jobservice.dto.JobRequest;
import com.talenttalk.jobservice.entity.Application;
import com.talenttalk.jobservice.entity.ApplicationStatus;
import com.talenttalk.jobservice.entity.Job;
import com.talenttalk.jobservice.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    @PostMapping("/post")
    public ResponseEntity<Job> postJob(@RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.createJob(request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllActiveJobs());
    }
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Job>> getJobsByCompany(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }
    @DeleteMapping("/{jobId}/delete")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return ResponseEntity.ok("Job deleted successfully");
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getJobById(jobId));
    }

    @PatchMapping("/{jobId}/close")
    public ResponseEntity<Job> closeJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.closeJob(jobId));
    }


    @PostMapping("/apply")
    public ResponseEntity<Application> applyToJob(
            @RequestBody ApplicationRequest request) {
        return ResponseEntity.ok(jobService.applyToJob(request));
    }
    @GetMapping("/{jobId}/applications")
    public ResponseEntity<List<Application>> getApplicationsByJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getApplicationsByJob(jobId));
    }


    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Application>> getApplicationsByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(jobService.getApplicationsByStudent(studentId));
    }
    @PostMapping("/application/{applicationId}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(jobService.updateApplicationStatus(applicationId, status));
    }


    @PatchMapping("/application/{applicationId}/withdraw")
    public ResponseEntity<Application> withdraw(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(jobService.withdrawApplication(applicationId));
    }
}