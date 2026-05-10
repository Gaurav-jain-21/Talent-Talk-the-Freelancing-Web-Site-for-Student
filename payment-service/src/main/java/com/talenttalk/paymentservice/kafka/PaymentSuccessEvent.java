package com.talenttalk.paymentservice.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSuccessEvent {
    private Long paymentId;
    private Long companyId;
    private Long jobId;
    private Long studentId;
    private Double amount;
    private String razorpayPaymentId;
}