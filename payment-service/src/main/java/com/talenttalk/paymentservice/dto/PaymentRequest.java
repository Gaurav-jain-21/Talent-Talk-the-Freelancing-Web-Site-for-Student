package com.talenttalk.paymentservice.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotNull(message = "Company ID cannot be null")
    private Long companyId;

    @NotNull(message = "Job ID cannot be null")
    private Long jobId;

    @NotNull(message = "Student ID cannot be null")
    private Long studentId;

    @NotNull(message = "Amount cannot be null")
    @Min(value = 1, message = "Amount must be at least 1")
    @Max(value = 1000000, message = "Amount cannot exceed 10 lakhs")
    private Double amount;
}