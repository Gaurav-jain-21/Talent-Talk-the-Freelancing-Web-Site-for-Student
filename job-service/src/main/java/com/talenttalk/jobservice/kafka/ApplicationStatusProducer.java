package com.talenttalk.jobservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationStatusProducer {

    private final KafkaTemplate<String, ApplicationStatusEvent>
            kafkaTemplate;

    public void publishStatusChanged(ApplicationStatusEvent event) {
        kafkaTemplate.send(
                KafkaTopics.APPLICATION_STATUS_CHANGED,
                event
        );
        log.info("Published status: {} for student: {}",
                event.getStatus(), event.getStudentEmail());
    }
}