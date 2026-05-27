package com.talenttalk.jobservice.service;

import com.talenttalk.jobservice.dto.ApplicationRequest;
import com.talenttalk.jobservice.dto.JobRequest;
import com.talenttalk.jobservice.entity.Application;
import com.talenttalk.jobservice.entity.ApplicationStatus;
import com.talenttalk.jobservice.entity.Job;
import com.talenttalk.jobservice.kafka.ApplicationStatusEvent;
import com.talenttalk.jobservice.kafka.ApplicationStatusProducer;
import com.talenttalk.jobservice.repository.ApplicationRepository;
import com.talenttalk.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    // Use ONLY @RequiredArgsConstructor with final fields
    // Never mix @Autowired with @RequiredArgsConstructor
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusProducer statusProducer;

    // Create job
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

    // Get all active jobs
    public List<Job> getAllActiveJobs() {
        return jobRepository.findAll()
                .stream()
                .filter(Job::getIsActive)
                .toList();
    }

    // Get jobs by company
    public List<Job> getJobsByCompany(Long companyId) {
        return jobRepository.findJobByCompanyId(companyId);
    }

    // Get single job
    public Job getJobById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "Job not found"));
    }

    // Update job
    public Job updateJob(Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "Job not found"));

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

        return jobRepository.save(job);
    }

    // Close job
    public Job closeJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "Job not found"));
        job.setIsActive(false);
        return jobRepository.save(job);
    }

    // Delete job
    @Transactional
    public void deleteJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "Job not found"));
        applicationRepository.deleteAllByJobId(jobId);
        jobRepository.delete(job);
    }

    @Transactional
    public void deleteJobsByCompany(Long companyId) {
        List<Job> jobs = jobRepository.findJobByCompanyId(companyId);
        jobs.forEach(job -> applicationRepository.deleteAllByJobId(job.getId()));
        jobRepository.deleteAllByCompanyId(companyId);
    }

    @Transactional
    public void deleteApplicationsByStudent(Long studentId) {
        applicationRepository.deleteAllByStudentId(studentId);
    }

    // Apply to job
    public Application applyToJob(ApplicationRequest request) {
        boolean alreadyApplied = applicationRepository
                .findAllByStudentId(request.getStudentId())
                .stream()
                .anyMatch(app -> app.getJobId()
                        .equals(request.getJobId()));

        if (alreadyApplied) {
            throw new RuntimeException(
                    "You have already applied to this job");
        }

        Application application = new Application();
        application.setJobId(request.getJobId());
        application.setStudentId(request.getStudentId());
        application.setStudentName(request.getStudentName());
        application.setStudentEmail(request.getStudentEmail());
        application.setStatus(ApplicationStatus.PENDING);
        application.setWorkStatus("NOT_STARTED");
        application.setAppliedAt(java.time.LocalDateTime.now());

        return applicationRepository.save(application);
    }

    // Get applications by job
    public List<Application> getApplicationsByJob(Long jobId) {
        return applicationRepository.findAllByJobId(jobId);
    }

    // Get applications by student
    public List<Application> getApplicationsByStudent(
            Long studentId) {
        return applicationRepository.findAllByStudentId(studentId);
    }

    // Update application status + publish Kafka event
    // Only ONE definition of this method
    public Application updateApplicationStatus(
            Long applicationId, ApplicationStatus status) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found"));

        application.setStatus(status);
        application.setUpdatedAt(java.time.LocalDateTime.now());

        if (status == ApplicationStatus.SELECTED) {
            Job job = jobRepository
                    .findById(application.getJobId())
                    .orElse(null);
            application.setProjectTitle(
                    job != null ? job.getTitle() : "Assigned project");
            if (application.getWorkStatus() == null
                    || application.getWorkStatus().isBlank()
                    || application.getWorkStatus().equals("NOT_STARTED")) {
                application.setWorkStatus("IN_PROGRESS");
            }
        }

        Application saved = applicationRepository.save(application);

        // Publish Kafka event only for SELECTED or REJECTED
        if (status == ApplicationStatus.SELECTED
                || status == ApplicationStatus.REJECTED) {

            Job job = jobRepository
                    .findById(application.getJobId())
                    .orElse(null);

            ApplicationStatusEvent event = new ApplicationStatusEvent(
                    application.getId(),
                    application.getJobId(),
                    application.getStudentId(),
                    application.getStudentName(),
                    application.getStudentEmail(),
                    job != null ? job.getTitle() : "Job",
                    job != null ? job.getCompanyName() : "Company",
                    status.name()
            );

            try {
                statusProducer.publishStatusChanged(event);
            } catch (Exception ignored) {
                // Status updates must not fail just because notification delivery is unavailable.
            }
        }

        return saved;
    }

    public Application updateWorkStatus(
            Long applicationId, String workStatus) {
        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found"));

        application.setWorkStatus(workStatus);
        application.setUpdatedAt(java.time.LocalDateTime.now());
        return applicationRepository.save(application);
    }

    // Withdraw application
    public Application withdrawApplication(Long applicationId) {
        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException(
                    "Can only withdraw a pending application");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setUpdatedAt(java.time.LocalDateTime.now());
        return applicationRepository.save(application);
    }
}
