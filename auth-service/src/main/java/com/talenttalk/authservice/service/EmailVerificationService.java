package com.talenttalk.authservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail,
                                      String name, String token) throws MessagingException {

        String verificationLink = baseUrl
                + "/auth/verify?token=" + token;

        String body = """
                <html>
                <body>
                    <h2>Welcome to Talent Talk, %s!</h2>
                    <p>Thank you for registering.
                    Please verify your email address
                    by clicking the button below:</p>
                    <br/>
                    <a href="%s"
                       style="background-color:#4CAF50;
                              color:white;
                              padding:14px 20px;
                              text-decoration:none;
                              border-radius:4px;">
                        Verify Email
                    </a>
                    <br/><br/>
                    <p>Or copy this link:</p>
                    <p>%s</p>
                    <br/>
                    <p>This link expires in 24 hours.</p>
                    <p><strong>Talent Talk Team</strong></p>
                </body>
                </html>
                """.formatted(name, verificationLink, verificationLink);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Verify your Talent Talk account");
        helper.setText(body, true);

        mailSender.send(message);
    }
}