package com.talenttalk.companyservice.service;

import com.talenttalk.companyservice.client.JobClient;
import com.talenttalk.companyservice.client.StudentClient;
import com.talenttalk.companyservice.dto.CompanyProfileRequest;
import com.talenttalk.companyservice.entity.CompanyProfile;
import com.talenttalk.companyservice.repository.CompanyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyProfileRepository companyProfileRepository;
    private final StudentClient studentClient;
    private final JobClient jobClient;

    public CompanyProfile createProfile(CompanyProfileRequest request) {
        if (companyProfileRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        CompanyProfile profile = new CompanyProfile();
        profile.setUserId(request.getUserId());
        profile.setCompanyName(request.getCompanyName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setWebsite(request.getWebsite());
        profile.setIndustry(request.getIndustry());
        profile.setLocation(request.getLocation());
        profile.setDescription(request.getDescription());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setCompanySize(request.getCompanySize());
        profile.setFoundedYear(request.getFoundedYear());

        return companyProfileRepository.save(profile);
    }
    public CompanyProfile updateProfile(Long userId,
                                        CompanyProfileRequest request) {
        CompanyProfile profile = companyProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setCompanyName(request.getCompanyName());
        profile.setPhone(request.getPhone());
        profile.setWebsite(request.getWebsite());
        profile.setIndustry(request.getIndustry());
        profile.setLocation(request.getLocation());
        profile.setDescription(request.getDescription());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setCompanySize(request.getCompanySize());
        profile.setFoundedYear(request.getFoundedYear());

        return companyProfileRepository.save(profile);
    }

    public CompanyProfile getProfileByUserId(Long userId) {
        return companyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public List<CompanyProfile> getAllCompanies() {
        return companyProfileRepository.findAll();
    }

    public List<Object> getAllStudents() {
        return studentClient.getAllStudents();
    }

    public Object getStudentProfile(Long userId) {
        return studentClient.getStudentProfile(userId);
    }

    public List<Object> getMyJobs(Long companyId) {
        return jobClient.getJobsByCompany(companyId);
    }

    public List<Object> getApplicants(Long jobId) {
        return jobClient.getApplicationsByJob(jobId);
    }

    public Object updateApplicationStatus(Long applicationId, String status) {
        return jobClient.updateApplicationStatus(applicationId, status);
    }
}