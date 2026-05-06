package com.talenttalk.interviewservice.controller;

import com.talenttalk.interviewservice.dto.AnswerRequest;
import com.talenttalk.interviewservice.dto.InterviewRequest;
import com.talenttalk.interviewservice.dto.InterviewResult;
import com.talenttalk.interviewservice.entity.Interview;
import com.talenttalk.interviewservice.entity.InterviewQuestion;
import com.talenttalk.interviewservice.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/create")
    public ResponseEntity<Interview> createInterview(
            @RequestBody InterviewRequest request) {
        return ResponseEntity.ok(
                interviewService.createInterview(request));
    }

    @PostMapping("/{interviewId}/start")
    public ResponseEntity<InterviewResult> startInterview(
            @PathVariable Long interviewId) {
        return ResponseEntity.ok(
                interviewService.startInterview(interviewId));
    }

    @GetMapping("/{interviewId}/next-question")
    public ResponseEntity<InterviewQuestion> getNextQuestion(
            @PathVariable Long interviewId) {
        return ResponseEntity.ok(
                interviewService.getNextQuestion(interviewId));
    }

    @PostMapping("/answer")
    public ResponseEntity<InterviewQuestion> submitAnswer(
            @RequestBody AnswerRequest request) {
        return ResponseEntity.ok(
                interviewService.submitAnswer(request));
    }

    @GetMapping("/{interviewId}/result")
    public ResponseEntity<InterviewResult> getResult(
            @PathVariable Long interviewId) {
        return ResponseEntity.ok(
                interviewService.getInterviewResult(interviewId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Interview>> getByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                interviewService.getInterviewsByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/pending")
    public ResponseEntity<List<Interview>> getPending(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                interviewService.getPendingInterviews(studentId));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Interview>> getByCompany(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(
                interviewService.getInterviewsByCompany(companyId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Interview>> getByJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(
                interviewService.getInterviewsByJob(jobId));
    }
}