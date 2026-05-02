package com.talenttalk.studentservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.talenttalk.studentservice.dto.ProjectRequest;
import com.talenttalk.studentservice.dto.StudentProfileRequest;
import com.talenttalk.studentservice.entity.Project;
import com.talenttalk.studentservice.entity.StudentProfile;
import com.talenttalk.studentservice.entity.WorkStatus;
import com.talenttalk.studentservice.repository.ProjectRepository;
import com.talenttalk.studentservice.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class StudentService {
    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private Cloudinary cloudinary;
    public StudentProfile createProfile(StudentProfileRequest request){
        if(studentProfileRepository.findByUserId(request.getUserId()).isPresent()){
            throw new RuntimeException("Profile already exists for this user");
        }
        StudentProfile profile= new StudentProfile();
        profile.setUserId(request.getUserId());
        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setCollege(request.getCollege());
        profile.setDegree(request.getDegree());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setWorkStatus(WorkStatus.AVAILABLE);

        return studentProfileRepository.save(profile);
    }

    public StudentProfile updateProfile(Long userId, StudentProfileRequest request){
        StudentProfile profile= studentProfileRepository.findByUserId(userId).orElseThrow(()-> new RuntimeException("Profile does not exist"));
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setCollege(request.getCollege());
        profile.setDegree(request.getDegree());
        profile.setGraduationYear(request.getGraduationYear());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());

        return studentProfileRepository.save(profile);
    }

    public String uploadResume(Long userId, MultipartFile file) throws IOException {
        // Step 1 — upload file to Cloudinary
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "raw",  // "raw" is for PDF files
                        "folder", "talenttalk/resumes"
                )
        );

        // Step 2 — get the URL Cloudinary gave back
        String resumeUrl = uploadResult.get("secure_url").toString();

        // Step 3 — save that URL in the student's profile
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setResumeUrl(resumeUrl);
        studentProfileRepository.save(profile);

        return resumeUrl;
    }

    public StudentProfile updateWorkStatus(Long userId, WorkStatus status) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setWorkStatus(status);
        return studentProfileRepository.save(profile);
    }
    public StudentProfile getProfileByUserId(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
    public List<StudentProfile> getAllProfiles() {
        return studentProfileRepository.findAll();
    }

    public Project addProject(Long studentId, ProjectRequest request) {
        studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Project project = new Project();
        project.setStudentId(studentId);
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setProjectUrl(request.getProjectUrl());

        return projectRepository.save(project);
    }

    public List<Project> getProjectsByStudentId(Long studentId) {
        return projectRepository.findByStudentId(studentId);
    }


}
