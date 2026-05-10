package com.talenttalk.paymentservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSuccessProducer {

    private final KafkaTemplate<String, PaymentSuccessEvent>
            kafkaTemplate;

    public void publishPaymentSuccess(PaymentSuccessEvent event) {
        kafkaTemplate.send(
                KafkaTopics.PAYMENT_SUCCESS,
                event
        );
        log.info("Published payment success event for job: {}",
                event.getJobId());
    }
}