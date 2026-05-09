package com.talenttalk.companyservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {
    private Long companyId;
    private Long jobId;
    private Long studentId;
    private Double amount;
}