package com.talenttalk.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name= "STUDENT-SERVICE")
public interface StudentClient {
    @GetMapping("/student/all")
    List<Object> getAllStudent();

    @DeleteMapping("/student/{userId}")
    void deleteStudent(@PathVariable Long userId);
}
