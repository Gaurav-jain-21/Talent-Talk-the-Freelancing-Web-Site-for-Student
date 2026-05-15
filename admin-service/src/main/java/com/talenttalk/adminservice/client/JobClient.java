package com.talenttalk.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name="JOB-SERVICE")
public interface JobClient {

    @GetMapping("/job/all")
    List<Object> getAllJobs();

    @GetMapping("/job/{jobId}/applications")
    List<Object> getApplicationsByJob(@PathVariable Long jobId);

    @DeleteMapping("/job/{jobId}/delete")
    void deleteJob(@PathVariable Long jobId);

    @DeleteMapping("/job/company/{companyId}/delete")
    void deleteJobsByCompany(@PathVariable Long companyId);

    @DeleteMapping("/job/student/{studentId}/applications")
    void deleteApplicationsByStudent(@PathVariable Long studentId);

    @PostMapping("/job/{jobId}/close")
    Object closeJob(@PathVariable Long jobId);
}
