package com.talenttalk.paymentservice.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.talenttalk.paymentservice.dto.PaymentRequest;
import com.talenttalk.paymentservice.dto.PaymentVerifyRequest;
import com.talenttalk.paymentservice.entity.Payment;
import com.talenttalk.paymentservice.entity.PaymentStatus;
import com.talenttalk.paymentservice.kafka.PaymentSuccessEvent;
import com.talenttalk.paymentservice.kafka.PaymentSuccessProducer;
import com.talenttalk.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Payment createOrder(PaymentRequest request) throws RazorpayException {

        int amountInPaise = (int) (request.getAmount() * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = razorpayOrder.get("id");

        Payment payment = new Payment();
        payment.setCompanyId(request.getCompanyId());
        payment.setJobId(request.getJobId());
        payment.setStudentId(request.getStudentId());
        payment.setAmount(request.getAmount());
        payment.setCurrency("INR");
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setStatus(PaymentStatus.CREATED);

        return paymentRepository.save(payment);
    }

    private final PaymentSuccessProducer paymentSuccessProducer;

    public String verifyPayment(PaymentVerifyRequest request)
            throws Exception {

        String data = request.getRazorpayOrderId()
                + "|" + request.getRazorpayPaymentId();

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(
                keySecret.getBytes(), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes());
        String generatedSignature = HexFormat.of().formatHex(hash);

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found"));

        if (generatedSignature.equals(request.getRazorpaySignature())) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // Publish Kafka event — job service will activate job
            PaymentSuccessEvent event = new PaymentSuccessEvent(
                    payment.getId(),
                    payment.getCompanyId(),
                    payment.getJobId(),
                    payment.getStudentId(),
                    payment.getAmount(),
                    request.getRazorpayPaymentId()
            );
            paymentSuccessProducer.publishPaymentSuccess(event);

            return "Payment verified successfully";
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return "Payment verification failed";
        }
    }


    public List<Payment> getPaymentsByCompany(Long companyId) {
        return paymentRepository.findByCompanyId(companyId);
    }


    public List<Payment> getPaymentsByStudent(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}