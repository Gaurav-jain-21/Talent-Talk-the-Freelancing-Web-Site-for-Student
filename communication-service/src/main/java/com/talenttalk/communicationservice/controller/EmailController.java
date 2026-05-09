package com.talenttalk.communicationservice.controller;

import com.talenttalk.communicationservice.dto.EmailRequest;
import com.talenttalk.communicationservice.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @Valid @RequestBody EmailRequest request) throws MessagingException {
        emailService.sendEmail(request);
        return ResponseEntity.ok("Email sent successfully to " + request.getToEmail());
    }
}