package com.talenttalk.adminservice.service;

import com.talenttalk.adminservice.client.CompanyClient;
import com.talenttalk.adminservice.client.JobClient;
import com.talenttalk.adminservice.client.PaymentClient;
import com.talenttalk.adminservice.client.StudentClient;
import com.talenttalk.adminservice.dto.DashboardStats;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
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
        return paymentClient.getPaymentsByCompany(companyId);
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

    public Object closeJob(Long jobId) {
        return jobClient.closeJob(jobId);
    }

}
