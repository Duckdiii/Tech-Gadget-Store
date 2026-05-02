package com.project.tech_gadget_store.service.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String fromName;
    private final String fromAddress;
    private final String replyToMode;
    private final String fixedReplyToAddress;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${app.email.from-name:TechStore System}") String fromName,
            @Value("${app.email.from-address:}") String fromAddress,
            @Value("${app.email.reply-to-mode:customer}") String replyToMode,
            @Value("${app.email.reply-to-address:}") String fixedReplyToAddress) {
        this.mailSender = mailSender;
        this.fromName = fromName;
        this.fromAddress = fromAddress;
        this.replyToMode = replyToMode;
        this.fixedReplyToAddress = fixedReplyToAddress;
    }

    @Override
    public void send(String to, String subject, String body, String replyTo) {
        try {
            MimeMessage message = mailSender.createMimeMessage(); // Tạo một đối tượng MimeMessage để chứa thông tin
                                                                  // email cần gửi, bao gồm người nhận, tiêu đề, nội
                                                                  // dung và các header khác.
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);

            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(new InternetAddress(fromAddress, fromName));
            }

            String resolvedReplyTo = resolveReplyTo(replyTo);
            if (resolvedReplyTo != null && !resolvedReplyTo.isBlank()) {
                helper.setReplyTo(resolvedReplyTo);
            }

            mailSender.send(message);
            log.info("Email sent: to={}, subject={}", to, subject);
        } catch (MessagingException ex) {
            log.error("Failed to send email: to={}, subject={}", to, subject, ex);
        } catch (Exception ex) {
            log.error("Unexpected error when sending email: to={}, subject={}", to, subject, ex);
        }
    }

    private String resolveReplyTo(String customerReplyTo) {
        if ("fixed".equalsIgnoreCase(replyToMode)) {
            return fixedReplyToAddress;
        }
        return customerReplyTo;
    }

    @Override
    public void sendOrderCreatedEmail(String to, String subject, String body) {
        send(to, subject, body, to);
    }

    @Override
    public void sendOrderUpdatedEmail(String to, String subject, String body) {
        send(to, subject, body, to);
    }

    @Override
    public void sendOrderCancelledEmail(String to, String subject, String body) {
        send(to, subject, body, to);
    }

    @Override
    public void sendOrderShippingEmail(String to, String subject, String body) {
        send(to, subject, body, to);
    }

    @Override
    public void sendOrderDeliveredEmail(String to, String subject, String body) {
        send(to, subject, body, to);
    }

    @Override
    public void sendPaymentResultEmail(String to, String subject, String body) {
        send(to, subject, body, to);
    }

}
