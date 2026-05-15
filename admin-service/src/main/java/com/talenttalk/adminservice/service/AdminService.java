package com.talenttalk.adminservice.service;

import com.talenttalk.adminservice.client.CompanyClient;
import com.talenttalk.adminservice.client.JobClient;
import com.talenttalk.adminservice.client.PaymentClient;
import com.talenttalk.adminservice.client.StudentClient;
import com.talenttalk.adminservice.dto.DashboardStats;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    @Autowired
    private StudentClient studentClient;

    @Autowired
    private JobClient jobClient;

    @Autowired
    private PaymentClient paymentClient;

    @Autowired
    private CompanyClient companyClient;

    public List<Object> getAllStudents(){
        return studentClient.getAllStudent();
    }

    public List<Object> getAllCompanies(){
        return companyClient.getAllCompanies();
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
            List<Object> companies = companyClient.getAllCompanies();
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
        jobClient.deleteApplicationsByStudent(userId);
        studentClient.deleteStudent(userId);
        return "Student deleted successfully";
    }

    public String deleteCompany(Long userId) {
        jobClient.deleteJobsByCompany(userId);
        companyClient.deleteCompany(userId);
        return "Company deleted successfully";
    }

    public Object closeJob(Long jobId) {
        return jobClient.closeJob(jobId);
    }

}
