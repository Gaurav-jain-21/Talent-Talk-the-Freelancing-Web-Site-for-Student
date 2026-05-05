package com.talenttalk.interviewservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "STUDENT-SERVICE")
public interface StudentClient {

    @GetMapping("/student/profile/{userId}")
    Map<String, Object> getStudentProfile(@PathVariable Long userId);
}