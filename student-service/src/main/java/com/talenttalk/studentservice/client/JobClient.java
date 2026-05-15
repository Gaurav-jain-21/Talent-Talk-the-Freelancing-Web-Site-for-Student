package com.talenttalk.studentservice.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

@FeignClient(name = "JOB-SERVICE")
public interface JobClient {

    @GetMapping("/job/student/{studentId}")
    List<Object> getStudentApplications(@PathVariable Long studentId);
    @GetMapping("/job/all")
    List<Object> getAllJobs();

    @PatchMapping("/job/application/{applicationId}/work-status")
    Object updateApplicationWorkStatus(
            @PathVariable Long applicationId,
            @RequestParam String workStatus);

    @PostMapping("/job/application/{applicationId}/work-status")
    Object updateApplicationWorkStatusPost(
            @PathVariable Long applicationId,
            @RequestParam String workStatus);
}
