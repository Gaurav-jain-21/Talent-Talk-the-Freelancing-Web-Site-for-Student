package com.talenttalk.jobservice.kafka;

import com.talenttalk.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSuccessConsumer {

    private final JobRepository jobRepository;

    @KafkaListener(
            topics = "payment-success",
            groupId = "job-group"
    )
    public void handlePaymentSuccess(
            PaymentSuccessEvent event) {

        log.info("Payment received for job: {}", event.getJobId());

        jobRepository.findById(event.getJobId())
                .ifPresent(job -> {
                    job.setIsActive(true);
                    jobRepository.save(job);
                    log.info("Job {} activated after payment",
                            event.getJobId());
                });
    }
}