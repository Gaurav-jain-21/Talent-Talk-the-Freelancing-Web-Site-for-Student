package com.talenttalk.jobservice.service;

import com.talenttalk.jobservice.dto.ApplicationRequest;
import com.talenttalk.jobservice.dto.JobRequest;
import com.talenttalk.jobservice.entity.Application;
import com.talenttalk.jobservice.entity.ApplicationStatus;
import com.talenttalk.jobservice.entity.Job;
import com.talenttalk.jobservice.repository.ApplicationRepository;
import com.talenttalk.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private final ApplicationRepository applicationRepository;

    public Job createJob(JobRequest request) {
        Job job = new Job();
        job.setCompanyId(request.getCompanyId());
        job.setCompanyName(request.getCompanyName());
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setJobType(request.getJobType());
        job.setOpenings(request.getOpenings());
        job.setLastDateToApply(request.getLastDateToApply());
        job.setIsActive(true);

        return jobRepository.save(job);
    }

    public List<Job> getAllActiveJobs() {
        return jobRepository.findAll()
                .stream()
                .filter(job -> job.getIsActive())
                .toList();
    }

    public List<Job> getJobsByCompany(Long companyId) {
        return jobRepository.findJobByCompanyId(companyId);
    }

    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public Job closeJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setIsActive(false);
        return jobRepository.save(job);
    }


    public Application applyToJob(ApplicationRequest request) {

        boolean alreadyApplied = applicationRepository
                .findAllByStudentId(request.getStudentId())
                .stream()
                .anyMatch(app -> app.getJobId().equals(request.getJobId()));

        if (alreadyApplied) {
            throw new RuntimeException("You have already applied to this job");
        }

        Application application = new Application();
        application.setJobId(request.getJobId());
        application.setStudentId(request.getStudentId());
        application.setStudentName(request.getStudentName());
        application.setStudentEmail(request.getStudentEmail());
        application.setStatus(ApplicationStatus.PENDING); // always PENDING on apply

        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        return applicationRepository.findAllByJobId(jobId);
    }

    public List<Application> getApplicationsByStudent(Long studentId) {
        return applicationRepository.findAllByStudentId(studentId);
    }

    public Application updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        return applicationRepository.save(application);
    }

    public Application withdrawApplication(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Can only withdraw a pending application");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        return applicationRepository.save(application);
    }
    public void deleteJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        jobRepository.delete(job);
    }
}