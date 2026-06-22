package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.project.tech_gadget_store.entity.Order;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getRecentOrdersByCustomerId(String customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findRecentOrdersByCustomerId(customerId, pageable).getContent();
    }

    public List<Order> trackOrderHistoryByCustomerId(String customerId) {
        Pageable pageable = PageRequest.of(0, 10); // Fetch the first 10 orders
        return orderRepository.findOrdersByCustomerId(customerId, pageable).getContent();
    }

    public List<Order> filterOrdersByDateRange(String customerId, LocalDateTime from, LocalDateTime to, int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomerIdAndDateRange(customerId, from, to, pageable).getContent();
    }

    public List<Order> filterOrdersByDay(String customerId, int year, int month, int day, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomerIdAndDay(customerId, year, month, day, pageable).getContent();
    }

    public List<Order> filterOrdersByMonth(String customerId, int year, int month, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomerIdAndMonth(customerId, year, month, pageable).getContent();
    }

    public List<Order> filterOrdersByYear(String customerId, int year, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomerIdAndYear(customerId, year, pageable).getContent();
    }

    public List<Order> filterOrdersByStatus(String customerId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findOrdersByCustomerIdAndOrderStatus(customerId, status, pageable).getContent();
    }
}
