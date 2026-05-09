package com.talenttalk.companyservice.client;

import com.talenttalk.companyservice.dto.PaymentRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentClient {

    @PostMapping("/payment/create")
    Object createPaymentOrder(@RequestBody PaymentRequestDto request);

    @GetMapping("/payment/company/{companyId}")
    Object getCompanyPayments(@PathVariable Long companyId);
}