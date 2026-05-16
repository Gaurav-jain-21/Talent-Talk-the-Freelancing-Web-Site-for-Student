package com.talenttalk.studentservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.talenttalk.studentservice.client.JobClient;
import com.talenttalk.studentservice.dto.ProjectRequest;
import com.talenttalk.studentservice.dto.StudentProfileRequest;
import com.talenttalk.studentservice.entity.Project;
import com.talenttalk.studentservice.entity.StudentProfile;
import com.talenttalk.studentservice.entity.WorkStatus;
import com.talenttalk.studentservice.repository.ProjectRepository;
import com.talenttalk.studentservice.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
        StudentProfile profile = findOrCreateProfile(userId);

        profile.setResumeUrl(resumeUrl);
        studentProfileRepository.save(profile);

        return resumeUrl;
    }

    public ResumePreview getResumePreview(Long userId) throws IOException {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        String resumeUrl = profile.getResumeUrl();
        if (resumeUrl == null || resumeUrl.isBlank()) {
            throw new RuntimeException("Resume not uploaded");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(resumeUrl))
                    .GET()
                    .build();
            HttpResponse<byte[]> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IOException("Unable to load resume");
            }

            String contentType = response.headers()
                    .firstValue("content-type")
                    .orElse(detectResumeContentType(resumeUrl));

            return new ResumePreview(
                    response.body(),
                    normalizeResumeContentType(contentType, resumeUrl, response.body()),
                    resumeFileName(resumeUrl));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("Resume preview interrupted", exception);
        } catch (IllegalArgumentException exception) {
            throw new IOException("Invalid resume URL", exception);
        }
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

    @Transactional
    public void deleteProfile(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        projectRepository.deleteByStudentId(userId);
        studentProfileRepository.delete(profile);
    }

    public Project addProject(Long studentId, ProjectRequest request) {
        studentProfileRepository.findByUserId(studentId)
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

    @Autowired
    private JobClient jobClient;

    public List<Object> getMyApplications(Long studentId) {
        return jobClient.getStudentApplications(studentId);
    }

    public List<Object> browseJobs() {
        return jobClient.getAllJobs();
    }

    public Object updateApplicationWorkStatus(
            Long applicationId, String workStatus) {
        try {
            return jobClient.updateApplicationWorkStatus(
                    applicationId, workStatus);
        } catch (Exception ignored) {
            return jobClient.updateApplicationWorkStatusPost(
                    applicationId, workStatus);
        }
    }

    private StudentProfile findOrCreateProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile nextProfile = new StudentProfile();
                    nextProfile.setUserId(userId);
                    nextProfile.setFullName("");
                    nextProfile.setEmail("");
                    nextProfile.setCollege("");
                    nextProfile.setDegree("");
                    nextProfile.setGraduationYear(java.time.Year.now().getValue());
                    nextProfile.setBio("");
                    nextProfile.setSkills("");
                    nextProfile.setWorkStatus(WorkStatus.AVAILABLE);
                    return studentProfileRepository.save(nextProfile);
                });
    }

    private static String normalizeResumeContentType(String contentType, String resumeUrl, byte[] bytes) {
        String detectedFromBytes = detectResumeContentType(bytes);
        if (!"application/octet-stream".equals(detectedFromBytes)) {
            return detectedFromBytes;
        }

        String normalized = contentType == null ? "" : contentType.toLowerCase();
        if (normalized.contains("pdf")) return "application/pdf";
        if (normalized.startsWith("image/")) return contentType;
        if (normalized.contains("word") || normalized.contains("officedocument")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        return detectResumeContentType(resumeUrl);
    }

    private static String detectResumeContentType(byte[] bytes) {
        if (bytes == null || bytes.length < 4) {
            return "application/octet-stream";
        }
        if (bytes[0] == 0x25 && bytes[1] == 0x50 && bytes[2] == 0x44 && bytes[3] == 0x46) {
            return "application/pdf";
        }
        if ((bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
            return "image/png";
        }
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (bytes.length >= 12
                && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
                && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50) {
            return "image/webp";
        }
        return "application/octet-stream";
    }

    private static String detectResumeContentType(String resumeUrl) {
        String normalized = resumeUrl == null ? "" : resumeUrl.toLowerCase();
        if (normalized.contains(".pdf")) return "application/pdf";
        if (normalized.contains(".png")) return "image/png";
        if (normalized.contains(".jpg") || normalized.contains(".jpeg")) return "image/jpeg";
        if (normalized.contains(".webp")) return "image/webp";
        if (normalized.contains(".doc") || normalized.contains(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        return "application/octet-stream";
    }

    private static String resumeFileName(String resumeUrl) {
        String path = URI.create(resumeUrl).getPath();
        int slashIndex = path.lastIndexOf('/');
        String fileName = slashIndex >= 0 ? path.substring(slashIndex + 1) : path;
        return fileName.isBlank() ? "resume.pdf" : fileName;
    }

    public record ResumePreview(byte[] bytes, String contentType, String fileName) {
    }
}
