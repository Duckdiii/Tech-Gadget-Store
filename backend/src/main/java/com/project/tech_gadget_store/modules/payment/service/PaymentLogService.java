package com.project.tech_gadget_store.modules.payment.service;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.common.exception.PaymentLogLoadException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentLogFilterRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentLogResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.modules.payment.repository.PaymentLogRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Slf4j
@Service
@Transactional(readOnly = true)
public class PaymentLogService {

    private final PaymentLogRepository paymentLogRepository;

    public PaymentLogService(PaymentLogRepository paymentLogRepository) {
        this.paymentLogRepository = paymentLogRepository;
    }

    public List<PaymentLogResponseDto> getPaymentLogs(PaymentLogFilterRequestDto filter) {
        List<PaymentLog> logs;
        try {
            logs = paymentLogRepository.findAll();
        } catch (Exception e) {
            log.error("Failed to load payment logs from database", e);
            throw new PaymentLogLoadException("Unable to load payment logs. Please try again later", e);
        }

        LocalDate start = null;
        LocalDate end = null;

        if (filter.getStartDate() != null && !filter.getStartDate().isBlank()) {
            try {
                start = LocalDate.parse(filter.getStartDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
            }
        }

        if (filter.getEndDate() != null && !filter.getEndDate().isBlank()) {
            try {
                end = LocalDate.parse(filter.getEndDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
            }
        }

        if (start != null && end != null && start.isAfter(end)) {
            throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
        }

        final LocalDate finalStart = start;
        final LocalDate finalEnd = end;

        List<PaymentLogResponseDto> results = logs.stream()
                .filter(log -> matchesFilter(log, filter, finalStart, finalEnd))
                .sorted(Comparator.comparing(BaseEntity::getCreatedAt).reversed())
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        if (results.isEmpty()) {
            throw new NoSuchElementException("No payment records found");
        }

        return results;
    }

    public Page<PaymentLogResponseDto> getPaymentLogs(PaymentLogFilterRequestDto filter, int page, int size) {
        PaymentLogStatus status = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                status = PaymentLogStatus.valueOf(filter.getStatus().toUpperCase().trim());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid status in search criteria");
            }
        }

        LocalDate startLocalDate = null;
        LocalDate endLocalDate = null;

        if (filter.getStartDate() != null && !filter.getStartDate().isBlank()) {
            try {
                startLocalDate = LocalDate.parse(filter.getStartDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
            }
        }

        if (filter.getEndDate() != null && !filter.getEndDate().isBlank()) {
            try {
                endLocalDate = LocalDate.parse(filter.getEndDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
            }
        }

        if (startLocalDate != null && endLocalDate != null && startLocalDate.isAfter(endLocalDate)) {
            throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
        }

        LocalDateTime startDateTime = startLocalDate != null ? startLocalDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endLocalDate != null ? endLocalDate.atTime(23, 59, 59, 999999999) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentLog> logPage;
        try {
            logPage = paymentLogRepository.findFilteredPaymentLogs(
                    status, startDateTime, endDateTime, pageable);
        } catch (Exception e) {
            log.error("Failed to load payment logs from database", e);
            throw new PaymentLogLoadException("Unable to load payment logs. Please try again later", e);
        }

        if (logPage.isEmpty()) {
            throw new java.util.NoSuchElementException("No payment records found");
        }

        return logPage.map(this::mapToResponseDto);
    }

    public com.project.tech_gadget_store.common.dto.CursorPageResponseDto<PaymentLogResponseDto> getPaymentLogsCursor(
            PaymentLogFilterRequestDto filter, String cursor, int limit) {
        PaymentLogStatus status = null;
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            try {
                status = PaymentLogStatus.valueOf(filter.getStatus().toUpperCase().trim());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid status in search criteria");
            }
        }

        LocalDate startLocalDate = null;
        LocalDate endLocalDate = null;

        if (filter.getStartDate() != null && !filter.getStartDate().isBlank()) {
            try {
                startLocalDate = LocalDate.parse(filter.getStartDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
            }
        }

        if (filter.getEndDate() != null && !filter.getEndDate().isBlank()) {
            try {
                endLocalDate = LocalDate.parse(filter.getEndDate());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
            }
        }

        if (startLocalDate != null && endLocalDate != null && startLocalDate.isAfter(endLocalDate)) {
            throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
        }

        LocalDateTime startDateTime = startLocalDate != null ? startLocalDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endLocalDate != null ? endLocalDate.atTime(23, 59, 59, 999999999) : null;

        LocalDateTime cursorTimestamp = null;
        String cursorId = null;

        com.project.tech_gadget_store.common.util.CursorUtil.DecodedCursor decoded = com.project.tech_gadget_store.common.util.CursorUtil.decodeCursor(cursor);
        if (decoded != null) {
            cursorTimestamp = decoded.getTimestamp();
            cursorId = decoded.getId();
        }

        Pageable pageable = PageRequest.of(0, limit + 1);
        List<PaymentLog> logs;
        try {
            logs = paymentLogRepository.findPaymentLogsCursor(
                    status, startDateTime, endDateTime, cursorTimestamp, cursorId, pageable);
        } catch (Exception e) {
            log.error("Failed to load payment logs from database", e);
            throw new PaymentLogLoadException("Unable to load payment logs. Please try again later", e);
        }

        if (logs.isEmpty()) {
            throw new java.util.NoSuchElementException("No payment records found");
        }

        boolean hasNext = logs.size() > limit;
        List<PaymentLog> resultLogs = hasNext ? logs.subList(0, limit) : logs;

        List<PaymentLogResponseDto> dtos = resultLogs.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        String nextCursor = null;
        if (hasNext && !resultLogs.isEmpty()) {
            PaymentLog lastLog = resultLogs.get(resultLogs.size() - 1);
            nextCursor = com.project.tech_gadget_store.common.util.CursorUtil.encodeCursor(lastLog.getCreatedAt(), lastLog.getId());
        }

        return new com.project.tech_gadget_store.common.dto.CursorPageResponseDto<>(dtos, nextCursor, hasNext);
    }

    public PaymentLogResponseDto getPaymentLogDetails(String logId) {
        PaymentLog logRecord;
        try {
            logRecord = paymentLogRepository.findById(logId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment log not found"));
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch payment log details for ID: {}", logId, e);
            throw new PaymentLogLoadException("Unable to load payment logs. Please try again later", e);
        }

        return mapToResponseDto(logRecord);
    }

    private boolean matchesFilter(PaymentLog log, PaymentLogFilterRequestDto filter, LocalDate start, LocalDate end) {
        // Filter by Date Range
        if (start != null) {
            if (log.getCreatedAt() == null || log.getCreatedAt().toLocalDate().isBefore(start)) {
                return false;
            }
        }
        if (end != null) {
            if (log.getCreatedAt() == null || log.getCreatedAt().toLocalDate().isAfter(end)) {
                return false;
            }
        }

        // Filter by Status
        if (filter.getStatus() != null && !filter.getStatus().isBlank()) {
            if (log.getStatus() == null || !log.getStatus().name().equalsIgnoreCase(filter.getStatus().trim())) {
                return false;
            }
        }

        return true;
    }

    private PaymentLogResponseDto mapToResponseDto(PaymentLog paymentLog) {
        Order order = paymentLog.getOrder();

        String orderId = order != null ? order.getId() : null;
        String customerName = null;
        String customerPhone = null;
        String customerEmail = null;

        if (order != null) {
            Customer customer = order.getCustomer();
            if (customer != null) {
                customerName = customer.getFullName();
                customerPhone = customer.getPhone();
                customerEmail = (customer.getAccount() != null) ? customer.getAccount().getEmail() : null;
            }
        }

        return PaymentLogResponseDto.builder()
                .id(paymentLog.getId())
                .orderId(orderId)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .amount(paymentLog.getAmount())
                .status(paymentLog.getStatus().name())
                .timestamp(paymentLog.getCreatedAt())
                .paidTime(paymentLog.getPaidAt())
                .failureReason(paymentLog.getFailureReason())
                .build();
    }
}
