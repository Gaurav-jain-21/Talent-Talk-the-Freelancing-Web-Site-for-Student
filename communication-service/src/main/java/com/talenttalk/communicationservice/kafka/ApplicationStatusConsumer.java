package com.talenttalk.communicationservice.kafka;

import com.talenttalk.communicationservice.dto.EmailRequest;
import com.talenttalk.communicationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationStatusConsumer {

    private final EmailService emailService;

    @KafkaListener(
            topics = "application-status-changed",
            groupId = "communication-group"
    )
    public void handleApplicationStatusChanged(
            ApplicationStatusEvent event) {

        log.info("Received application status event: {} for {}",
                event.getStatus(), event.getStudentEmail());

        try {
            // Build email request from event
            EmailRequest emailRequest = new EmailRequest();
            emailRequest.setToEmail(event.getStudentEmail());
            emailRequest.setStudentName(event.getStudentName());
            emailRequest.setJobTitle(event.getJobTitle());
            emailRequest.setCompanyName(event.getCompanyName());
            emailRequest.setStatus(event.getStatus());

            // Send email automatically
            emailService.sendEmail(emailRequest);

            log.info("Email sent successfully to {}",
                    event.getStudentEmail());

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}",
                    event.getStudentEmail(), e.getMessage());
        }
    }
}