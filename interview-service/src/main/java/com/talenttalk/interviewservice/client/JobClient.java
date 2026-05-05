package com.talenttalk.interviewservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "JOB-SERVICE")
public interface JobClient {

    @GetMapping("/job/{jobId}")
    Map<String, Object> getJobById(@PathVariable Long jobId);
}