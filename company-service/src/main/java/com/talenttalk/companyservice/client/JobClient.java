package com.talenttalk.companyservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name="JOB-SERVICE")
public interface JobClient {
    @GetMapping("/job/company/{companyId}")
    List<Object> getJobsByCompany(@PathVariable Long companyId);

    @GetMapping("/job/{jobId}/applications")
    List<Object> getApplicationsByJob(@PathVariable Long jobId);

    @PatchMapping("/job/application/{applicationId}/status")
    Object updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status);

    @PatchMapping("/job/application/{applicationId}/withdraw")
    Object withdrawApplication(@PathVariable Long applicationId);
}
