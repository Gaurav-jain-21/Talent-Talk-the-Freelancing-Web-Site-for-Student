package com.talenttalk.jobservice.kafka;

import com.talenttalk.jobservice.entity.ApplicationStatus;
import com.talenttalk.jobservice.repository.ApplicationRepository;
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
    private final ApplicationRepository applicationRepository;

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

        if (event.getApplicationId() != null) {
            applicationRepository.findById(event.getApplicationId())
                    .ifPresent(application -> {
                        application.setStatus(ApplicationStatus.PAID);
                        application.setWorkStatus("PAID");
                        application.setUpdatedAt(java.time.LocalDateTime.now());
                        applicationRepository.save(application);
                        log.info("Application {} marked paid",
                                event.getApplicationId());
                    });
        }
    }
}
