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
import java.util.Map;

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
    public ResponseEntity<Payment> verifyPayment(
            @RequestBody PaymentVerifyRequest request) throws Exception {
        return ResponseEntity.ok(paymentService.verifyPayment(request));
    }

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> getRazorpayKey() {
        return ResponseEntity.ok(Map.of("key", paymentService.getRazorpayKeyId()));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Payment>> getByCompany(
            @PathVariable Long companyId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCompany(companyId));
    }

    @GetMapping({"", "/", "/all", "/admin/all", "/transactions"})
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Payment>> getByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByStudent(studentId));
    }

    @GetMapping("/{paymentId:\\d+}")
    public ResponseEntity<Payment> getById(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }
}
