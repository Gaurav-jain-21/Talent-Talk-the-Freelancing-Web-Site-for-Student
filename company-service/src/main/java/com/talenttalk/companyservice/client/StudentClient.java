package com.talenttalk.companyservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name="STUDENT-SERVICE")
public interface StudentClient {
    @GetMapping("/student/all")
    List<Object> getAllStudents();

    @GetMapping("/student/profile/{userId}")
    Object getStudentProfile(@PathVariable Long userId);

}
