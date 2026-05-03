package com.talenttalk.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name="JOB-SERVICE")
public interface JobClient {

    @GetMapping("/job/all")
    List<Object> getAllJobs();

    @GetMapping("/job/{jobId}/applications")
    List<Object> getApplicationsByJob(@PathVariable Long jobId);

    @DeleteMapping("/job/{jobId}/delete")
    void deleteJob(@PathVariable Long jobId);

    @PatchMapping("/job/{jobId}/close")
    Object closeJob(@PathVariable Long jobId);
}
