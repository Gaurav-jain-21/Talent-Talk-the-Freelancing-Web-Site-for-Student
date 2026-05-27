package com.talenttalk.adminservice.service;

import com.talenttalk.adminservice.client.CompanyClient;
import com.talenttalk.adminservice.client.AuthClient;
import com.talenttalk.adminservice.client.JobClient;
import com.talenttalk.adminservice.client.PaymentClient;
import com.talenttalk.adminservice.client.StudentClient;
import com.talenttalk.adminservice.dto.DashboardStats;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private static final String INTERNAL_SERVICE = "ADMIN-SERVICE";

    @Autowired
    private StudentClient studentClient;

    @Autowired
    private JobClient jobClient;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private CompanyClient companyClient;

    @Autowired
    private AuthClient authClient;

    @Autowired
    private ObjectMapper objectMapper;

    public List<Object> getAllStudents(){
        return studentClient.getAllStudent();
    }

    public List<Object> getAllCompanies(){
        Map<String, Map<String, Object>> companiesByUserId = new LinkedHashMap<>();

        try {
            for (Map<String, Object> user : authClient.getUsersByRole("COMPANY", INTERNAL_SERVICE)) {
                String userId = String.valueOf(user.get("userId"));
                Map<String, Object> row = new LinkedHashMap<>(user);
                row.putIfAbsent("companyName", user.getOrDefault("name", "Company"));
                row.putIfAbsent("industry", "Not added");
                row.putIfAbsent("location", "Not added");
                row.putIfAbsent("companySize", "Not added");
                companiesByUserId.put(userId, row);
            }
        } catch (Exception e) {
            log.warn("Auth service failed while loading registered companies: {}", e.getMessage());
        }

        try {
            for (Object profile : companyClient.getAllCompanies()) {
                Map<String, Object> profileMap = toMap(profile);
                String userId = String.valueOf(profileMap.getOrDefault("userId", profileMap.get("id")));
                Map<String, Object> row = new LinkedHashMap<>(
                        companiesByUserId.getOrDefault(userId, new LinkedHashMap<>())
                );
                row.putAll(profileMap);
                row.put("profileCompleted", true);
                companiesByUserId.put(userId, row);
            }
        } catch (Exception e) {
            log.warn("Company service failed while loading company profiles: {}", e.getMessage());
        }

        return new ArrayList<>(companiesByUserId.values());
    }
    public List<Object> getAllJobs() {
        return jobClient.getAllJobs();
    }


    public List<Object> getAllApplications(Long jobId) {
        return jobClient.getApplicationsByJob(jobId);
    }

    public List<Object> getAllPayments(Long companyId) {
        try {
            return paymentClient.getPaymentsByCompany(companyId);
        } catch (FeignException e) {
            log.warn("Payment service failed while loading payments for company {}: {}", companyId, e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Object> getAllPayments() {
        try {
            return paymentClient.getAllPayments();
        } catch (FeignException e) {
            log.warn("Payment service failed while loading all payments: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public DashboardStats getDashboardStats(){
        DashboardStats stats= new DashboardStats();
        try{
            List<Object> students= studentClient.getAllStudent();
            stats.setTotalStudents(students!=null ? students.size():0);
        }catch (Exception e) {
            stats.setTotalStudents(0);
        }
        try {
            List<Object> companies = getAllCompanies();
            stats.setTotalCompanies(companies != null ? companies.size() : 0);
        } catch (Exception e) {
            stats.setTotalCompanies(0);
        }

        try {
            List<Object> jobs = jobClient.getAllJobs();
            stats.setTotalJobs(jobs != null ? jobs.size() : 0);
        } catch (Exception e) {
            stats.setTotalJobs(0);
        }

        stats.setServiceStatus("All services running");
        return stats;
    }
    public String deleteJob(Long jobId) {
        jobClient.deleteJob(jobId);
        return "Job deleted successfully";
    }

    public String deleteStudent(Long userId) {
        runCleanup("student applications", userId, () -> jobClient.deleteApplicationsByStudent(userId));
        runCleanup("student profile", userId, () -> studentClient.deleteStudent(userId));
        runCleanup("auth user", userId, () -> authClient.deleteUser(userId, INTERNAL_SERVICE));
        return "Student deleted successfully";
    }

    public String deleteCompany(Long userId) {
        runCleanup("company jobs", userId, () -> jobClient.deleteJobsByCompany(userId));
        runCleanup("company profile", userId, () -> companyClient.deleteCompany(userId));
        runCleanup("auth user", userId, () -> authClient.deleteUser(userId, INTERNAL_SERVICE));
        return "Company deleted successfully";
    }

    public Object closeJob(Long jobId) {
        return jobClient.closeJob(jobId);
    }

    private void runCleanup(String target, Long userId, Runnable cleanup) {
        try {
            cleanup.run();
        } catch (FeignException.NotFound | FeignException.BadRequest e) {
            log.info("Skipping {} cleanup for user {} because it was already absent: {}", target, userId, e.getMessage());
        }
    }

    private Map<String, Object> toMap(Object value) {
        return objectMapper.convertValue(value, new TypeReference<>() {});
    }

}
