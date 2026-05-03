package com.talenttalk.paymentservice.repository;

import com.talenttalk.paymentservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCompanyId(Long companyId);
    List<Payment> findByStudentId(Long studentId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}