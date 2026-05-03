package com.talenttalk.paymentservice.dto;


import lombok.Data;

@Data
public class PaymentRequest {
    private Long companyId;
    private Long jobId;
    private Long studentId;
    private Double amount;
}