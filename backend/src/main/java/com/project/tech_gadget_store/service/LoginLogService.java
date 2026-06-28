package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.repository.LoginLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoginLogService {

    private final LoginLogRepository loginLogRepository;

    public LoginLogService(LoginLogRepository loginLogRepository) {
        this.loginLogRepository = loginLogRepository;
    }

    public List<LoginLogResponseDto> getAllLoginLogs() {
        return loginLogRepository.findAll().stream()
                .map(log -> LoginLogResponseDto.builder()
                        .id(log.getId())
                        .createdAt(log.getCreatedAt())
                        .updatedAt(log.getUpdatedAt())
                        .accountId(log.getAccount().getId())
                        .email(log.getEmail())
                        .roleName(log.getRoleName())
                        .loginStatus(log.getLoginStatus())
                        .loginTime(log.getLoginTime())
                        .build())
                .toList();
    }
}
