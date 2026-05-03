package com.talenttalk.companyservice.dto;

import lombok.Data;

@Data
public class CompanyProfileRequest {
    private Long userId;
    private String companyName;
    private String email;
    private String phone;
    private String website;
    private String industry;
    private String location;
    private String description;
    private String logoUrl;
    private String companySize;
    private Integer foundedYear;
}
