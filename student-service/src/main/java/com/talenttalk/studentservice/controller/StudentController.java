package com.talenttalk.studentservice.controller;

import com.talenttalk.studentservice.dto.ProjectRequest;
import com.talenttalk.studentservice.dto.StudentProfileRequest;
import com.talenttalk.studentservice.entity.Project;
import com.talenttalk.studentservice.entity.StudentProfile;
import com.talenttalk.studentservice.entity.WorkStatus;
import com.talenttalk.studentservice.service.StudentService;
import com.talenttalk.studentservice.service.StudentService.ResumePreview;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {
    @Autowired
    private StudentService studentService;
    @PostMapping("/profile")
    public ResponseEntity<StudentProfile> createProfile(@Valid @RequestBody StudentProfileRequest request){
        return ResponseEntity.ok(studentService.createProfile(request));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<StudentProfile> updateProfile(@PathVariable Long userId, @Valid @RequestBody StudentProfileRequest request){
        return ResponseEntity.ok(studentService.updateProfile(userId,request));
    }

    @PostMapping("/profile/{userId}/resume")
    public ResponseEntity<String> uploadResume(@PathVariable Long userId, @RequestParam("file") MultipartFile file) throws IOException {
        String url= studentService.uploadResume(userId,file);
        return ResponseEntity.ok("Resume uploaded : "+url);
    }

    @GetMapping("/profile/{userId}/resume/preview")
    public ResponseEntity<byte[]> previewResume(@PathVariable Long userId) throws IOException {
        ResumePreview preview = studentService.getResumePreview(userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(preview.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(preview.fileName())
                                .build()
                                .toString())
                .body(preview.bytes());
    }

    @PatchMapping("/profile/{userId}/status")
    public ResponseEntity<StudentProfile> updateStatus(@PathVariable Long userId, @RequestParam WorkStatus status){
        return ResponseEntity.ok(studentService.updateWorkStatus(userId,status));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<StudentProfile> getProfile(
            @PathVariable Long userId) {
        return ResponseEntity.ok(studentService.getProfileByUserId(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<StudentProfile>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllProfiles());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long userId) {
        studentService.deleteProfile(userId);
        return ResponseEntity.ok("Student deleted successfully");
    }


    @PostMapping("/profile/{studentId}/project")
    public ResponseEntity<Project> addProject(
            @PathVariable Long studentId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(studentService.addProject(studentId, request));
    }


    @GetMapping("/profile/{studentId}/projects")
    public ResponseEntity<List<Project>> getProjects(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.getProjectsByStudentId(studentId));
    }

    @GetMapping("/profile/{studentId}/applications")
    public ResponseEntity<List<Object>> getMyApplications(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                studentService.getMyApplications(studentId));
    }

    @PatchMapping("/application/{applicationId}/work-status")
    public ResponseEntity<Object> updateApplicationWorkStatus(
            @PathVariable Long applicationId,
            @RequestParam String workStatus) {
        return ResponseEntity.ok(
                studentService.updateApplicationWorkStatus(
                        applicationId, workStatus));
    }

    @PostMapping("/application/{applicationId}/work-status")
    public ResponseEntity<Object> updateApplicationWorkStatusPost(
            @PathVariable Long applicationId,
            @RequestParam String workStatus) {
        return ResponseEntity.ok(
                studentService.updateApplicationWorkStatus(
                        applicationId, workStatus));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Object>> browseJobs() {
        return ResponseEntity.ok(studentService.browseJobs());
    }

}
