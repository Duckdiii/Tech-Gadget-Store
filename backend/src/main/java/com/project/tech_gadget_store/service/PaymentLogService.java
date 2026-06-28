package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.PaymentLogFilterRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentLogResponseDto;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import com.project.tech_gadget_store.exception.PaymentLogLoadException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.PaymentLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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

        // Filter by Payment Method
        if (filter.getPaymentMethod() != null && !filter.getPaymentMethod().isBlank()) {
            String filterMethod = filter.getPaymentMethod().trim();
            String methodType = getPaymentMethodType(log.getPaymentMethod());
            String methodName = log.getPaymentMethod().getName();

            boolean typeMatches = methodType.equalsIgnoreCase(filterMethod);
            boolean nameMatches = methodName != null && methodName.toLowerCase().contains(filterMethod.toLowerCase());

            if (!typeMatches && !nameMatches) {
                return false;
            }
        }

        return true;
    }

    private String getPaymentMethodType(PaymentMethod pm) {
        if (pm instanceof MomoPaymentMethod) {
            return "MOMO";
        } else if (pm instanceof VNPayPaymentMethod) {
            return "VNPAY";
        } else if (pm instanceof CODPaymentMethod) {
            return "COD";
        }
        return "UNKNOWN";
    }

    private PaymentLogResponseDto mapToResponseDto(PaymentLog paymentLog) {
        Order order = paymentLog.getOrder();
        PaymentMethod pm = paymentLog.getPaymentMethod();

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

        Map<String, String> metadata = new LinkedHashMap<>();
        if (pm instanceof MomoPaymentMethod momo) {
            metadata.put("partnerCode", momo.getPartnerCode());
            metadata.put("merchantId", momo.getMerchantId());
            metadata.put("endpointUrl", momo.getEndpointUrl());
        } else if (pm instanceof VNPayPaymentMethod vnpay) {
            metadata.put("terminalCode", vnpay.getTerminalCode());
            metadata.put("endpointUrl", vnpay.getEndpointUrl());
        } else if (pm instanceof CODPaymentMethod cod) {
            if (cod.getMaxAmount() != null) {
                metadata.put("maxAmount", cod.getMaxAmount().toString());
            }
            if (cod.getServiceFee() != null) {
                metadata.put("serviceFee", cod.getServiceFee().toString());
            }
        }

        return PaymentLogResponseDto.builder()
                .id(paymentLog.getId())
                .orderId(orderId)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .amount(paymentLog.getAmount())
                .paymentMethod(pm.getName())
                .paymentMethodType(getPaymentMethodType(pm))
                .status(paymentLog.getStatus().name())
                .timestamp(paymentLog.getCreatedAt())
                .paidTime(paymentLog.getPaidAt())
                .failureReason(paymentLog.getFailureReason())
                .metadata(metadata.isEmpty() ? null : metadata)
                .build();
    }
}
