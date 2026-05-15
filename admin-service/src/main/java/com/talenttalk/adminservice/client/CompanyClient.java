package com.talenttalk.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "COMPANY-SERVICE")
public interface CompanyClient {

    @GetMapping("/company/all")
    List<Object> getAllCompanies();

    @DeleteMapping("/company/{userId}")
    void deleteCompany(@PathVariable Long userId);
}
