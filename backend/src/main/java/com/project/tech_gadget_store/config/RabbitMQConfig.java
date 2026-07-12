package com.project.tech_gadget_store.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // Exchange là điểm mà producer (backend của bạn) gửi message tới — chứ không
    // gửi thẳng vào queue
    // Exchange nhận message xong thì tự quyết định "copy/route" nó sang những queue
    // nào, dựa theo loại exchange + routing key
    public static final String ORDER_PLACED_EXCHANGE = "order.placed.exchange";

    // Queue là nơi mà consumer (các service khác) sẽ lấy message ra để xử lý
    public static final String ORDER_EMAIL_QUEUE = "order.email.queue";
    public static final String ORDER_INVOICE_QUEUE = "order.invoice.queue";
    public static final String ORDER_NOTIFICATION_QUEUE = "order.notification.queue";

    // Dead Letter Exchange (DLX) là một exchange đặc biệt mà các message bị "dead"
    // (không được xử lý thành công) sẽ được gửi tới.
    private static final String DEAD_LETTER_EXCHANGE = "order.placed.dlx";
    private static final String DEAD_LETTER_QUEUE = "order.placed.dlq";
    // --------------------------------------------------------------------------------------------------------------------------

    @Bean
    // FanoutExchange là loại exchange mà khi nhận message sẽ gửi "copy" message đó
    // tới tất cả các queue được bind với nó
    // nơi CheckoutFacade gửi message tới. FanoutExchange = loại "phát cho tất cả".
    public FanoutExchange orderPlacedExchange() {
        return new FanoutExchange(ORDER_PLACED_EXCHANGE);
    }
    // --------------------------------------------------------------------------------------------------------------------------

    @Bean
    public FanoutExchange orderPlacedDeadLetterExchange() { // "cửa" nhận message chết
        return new FanoutExchange(DEAD_LETTER_EXCHANGE);
    }

    @Bean
    // QueueBuilder.durable(name) tạo ra một queue có tên là name và có tính chất
    // durable (tồn tại qua các lần restart của RabbitMQ)
    public Queue orderPlacedDeadLetterQueue() { //// "kho" chứa message chết
        return QueueBuilder.durable(DEAD_LETTER_QUEUE).build();
    }

    @Bean
    // nối 2 cái trên lại
    public Binding deadLetterBinding(Queue orderPlacedDeadLetterQueue, FanoutExchange orderPlacedDeadLetterExchange) {
        return BindingBuilder.bind(orderPlacedDeadLetterQueue).to(orderPlacedDeadLetterExchange);
    }
    // --------------------------------------------------------------------------------------------------------------------------

    // Các queue chính (email, invoice, notification) sẽ được tạo ra với tính năng
    // Dead Letter
    @Bean
    public Queue orderEmailQueue() {
        return buildQueueWithDeadLetter(ORDER_EMAIL_QUEUE);
    }

    @Bean
    public Queue orderInvoiceQueue() {
        return buildQueueWithDeadLetter(ORDER_INVOICE_QUEUE);
    }

    @Bean
    public Queue orderNotificationQueue() {
        return buildQueueWithDeadLetter(ORDER_NOTIFICATION_QUEUE);
    }
    // --------------------------------------------------------------------------------------------------------------------------

    // Binding — dây nối exchange với queue
    @Bean
    public Binding orderEmailBinding(Queue orderEmailQueue, FanoutExchange orderPlacedExchange) {
        return BindingBuilder.bind(orderEmailQueue).to(orderPlacedExchange);
    }

    @Bean
    public Binding orderInvoiceBinding(Queue orderInvoiceQueue, FanoutExchange orderPlacedExchange) {
        return BindingBuilder.bind(orderInvoiceQueue).to(orderPlacedExchange);
    }

    @Bean
    public Binding orderNotificationBinding(Queue orderNotificationQueue, FanoutExchange orderPlacedExchange) {
        return BindingBuilder.bind(orderNotificationQueue).to(orderPlacedExchange);
    }

    // --------------------------------------------------------------------------------------------------------------------------
    // Message trong RabbitMQ về bản chất chỉ là các byte array. Nhưng trong thực
    // tế, chúng ta thường muốn gửi các object (ví dụ: OrderPlacedEvent) thay vì
    // byte array. Vì vậy, chúng ta cần một MessageConverter để chuyển đổi giữa
    // object và byte array.
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter(); // là "phiên dịch viên": khi gửi, nó tự convert object Java
    }

    @Bean
    // là "cái tay" mà CheckoutFacade cầm để gửi message
    // (rabbitTemplate.convertAndSend(...))
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
    // --------------------------------------------------------------------------------------------------------------------------

    private Queue buildQueueWithDeadLetter(String name) {
        return QueueBuilder.durable(name)
                .withArgument("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE)
                .build();
    }
}
