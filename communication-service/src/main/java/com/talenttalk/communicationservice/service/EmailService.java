package com.talenttalk.communicationservice.service;


import com.talenttalk.communicationservice.dto.EmailRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(EmailRequest request) throws MessagingException {

        String subject;
        String body;

        if (request.getStatus().equalsIgnoreCase("SELECTED")) {
            subject = "Congratulations! You have been selected — " + request.getJobTitle();
            body = """
                    <html>
                    <body>
                        <h2>Congratulations, %s! 🎉</h2>
                        <p>We are thrilled to inform you that you have been
                        <strong>selected</strong> for the position of
                        <strong>%s</strong> at <strong>%s</strong>.</p>
                        <p>The company will contact you shortly with next steps.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p><strong>Talent Talk Team</strong></p>
                    </body>
                    </html>
                    """.formatted(
                    request.getStudentName(),
                    request.getJobTitle(),
                    request.getCompanyName()
            );
        } else {
            subject = "Application Update — " + request.getJobTitle();
            body = """
                    <html>
                    <body>
                        <h2>Dear %s,</h2>
                        <p>Thank you for applying for the position of
                        <strong>%s</strong> at <strong>%s</strong>.</p>
                        <p>After careful consideration, we regret to inform you
                        that you have not been selected for this role at this time.</p>
                        <p>We encourage you to keep applying and wish you
                        the best in your career journey.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p><strong>Talent Talk Team</strong></p>
                    </body>
                    </html>
                    """.formatted(
                    request.getStudentName(),
                    request.getJobTitle(),
                    request.getCompanyName()
            );
        }


        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

        helper.setTo(request.getToEmail());
        helper.setSubject(subject);
        helper.setText(body, true);

        mailSender.send(mimeMessage);
    }
}