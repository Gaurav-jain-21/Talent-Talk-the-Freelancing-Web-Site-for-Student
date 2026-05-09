package com.talenttalk.paymentservice.controller;

import com.talenttalk.paymentservice.dto.PaymentRequest;
import com.talenttalk.paymentservice.dto.PaymentVerifyRequest;
import com.talenttalk.paymentservice.entity.Payment;
import com.talenttalk.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    @PostMapping("/create")
    public ResponseEntity<Payment> createOrder(
            @Valid @RequestBody PaymentRequest request) throws Exception {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestBody PaymentVerifyRequest request) throws Exception {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Payment>> getByCompany(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCompany(companyId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Payment>> getByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByStudent(studentId));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<Payment> getById(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }
}