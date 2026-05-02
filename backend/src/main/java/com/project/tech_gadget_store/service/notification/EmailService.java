package com.project.tech_gadget_store.service.notification;

public interface EmailService {
    void send(String to, String subject, String body, String replyTo);

    void sendOrderCreatedEmail(String to, String subject, String body);

    void sendOrderUpdatedEmail(String to, String subject, String body);

    void sendOrderCancelledEmail(String to, String subject, String body);

    void sendOrderShippingEmail(String to, String subject, String body);

    void sendOrderDeliveredEmail(String to, String subject, String body);

    void sendPaymentResultEmail(String to, String subject, String body);

}
