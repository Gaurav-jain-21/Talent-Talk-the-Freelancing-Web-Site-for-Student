package com.talenttalk.companyservice.client;

import com.talenttalk.companyservice.dto.EmailRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "COMMUNICATION-SERVICE")
public interface CommunicationClient {

    @PostMapping("/email/send")
    String sendEmail(@RequestBody EmailRequestDto request);
}