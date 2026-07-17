package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.modules.auth.dto.response.CustomerStatsResponseDto;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;


@Service
@Transactional(readOnly = true)
public class CustomerStatsService {

    private final CustomerRepository customerRepository;

    public CustomerStatsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerStatsResponseDto getStats(String startDate, String endDate) {
        LocalDateTime start;
        LocalDateTime end;
        try {
            start = LocalDate.parse(startDate.trim()).atStartOfDay();
            end = LocalDate.parse(endDate.trim()).atTime(LocalTime.MAX);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
        }
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date range");
        }

        long newCustomers = customerRepository.countByCreatedAtBetween(start, end);
        long totalCustomers = customerRepository.count();

        return CustomerStatsResponseDto.builder()
                .newCustomers(newCustomers)
                .totalCustomers(totalCustomers)
                .build();
    }
}
