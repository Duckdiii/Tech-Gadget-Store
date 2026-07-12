package com.project.tech_gadget_store.modules.order.listener;

import com.project.tech_gadget_store.config.RabbitMQConfig;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.event.OrderPlacedMessage;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.order.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Eagerly creates the {@code Invoice} row right after checkout, off the critical path — see
 * {@link com.project.tech_gadget_store.modules.order.service.CheckoutFacade}. Reuses
 * {@link InvoiceService#getOrCreateInvoice}, which is idempotent, so the customer's later
 * on-demand "view invoice" request (InvoiceController) just finds it already created.
 */
@Component
@RequiredArgsConstructor
public class OrderInvoiceConsumer {

    private final OrderRepository orderRepository;
    private final InvoiceService invoiceService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_INVOICE_QUEUE)
    public void handleOrderPlaced(OrderPlacedMessage message) {
        Order order = orderRepository.findById(message.orderId())
                .orElseThrow(() -> new IllegalStateException("Order not found: " + message.orderId()));

        if (order.getCustomer() == null || order.getCustomer().getAccount() == null) {
            throw new IllegalStateException("Order " + order.getId() + " has no customer account for invoice");
        }

        String customerEmail = order.getCustomer().getAccount().getEmail();
        invoiceService.getOrCreateInvoice(order.getId(), customerEmail);
    }
}
