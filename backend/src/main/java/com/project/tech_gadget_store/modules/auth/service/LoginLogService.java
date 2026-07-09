package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.LoginLog;
import com.project.tech_gadget_store.modules.auth.repository.LoginLogRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;



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

    public org.springframework.data.domain.Page<LoginLogResponseDto> getLoginLogsPaginated(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return loginLogRepository.findAll(pageable)
                .map(log -> LoginLogResponseDto.builder()
                        .id(log.getId())
                        .createdAt(log.getCreatedAt())
                        .updatedAt(log.getUpdatedAt())
                        .accountId(log.getAccount().getId())
                        .email(log.getEmail())
                        .roleName(log.getRoleName())
                        .loginStatus(log.getLoginStatus())
                        .loginTime(log.getLoginTime())
                        .build());
    }

    public com.project.tech_gadget_store.common.dto.CursorPageResponseDto<LoginLogResponseDto> getLoginLogsCursor(String cursor, int limit) {
        LocalDateTime cursorTimestamp = null;
        String cursorId = null;

        com.project.tech_gadget_store.common.util.CursorUtil.DecodedCursor decoded = com.project.tech_gadget_store.common.util.CursorUtil.decodeCursor(cursor);
        if (decoded != null) {
            cursorTimestamp = decoded.getTimestamp();
            cursorId = decoded.getId();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, limit + 1);
        List<com.project.tech_gadget_store.modules.auth.entity.LoginLog> logs = loginLogRepository.findLoginLogsCursor(cursorTimestamp, cursorId, pageable);

        boolean hasNext = logs.size() > limit;
        List<com.project.tech_gadget_store.modules.auth.entity.LoginLog> resultLogs = hasNext ? logs.subList(0, limit) : logs;

        List<LoginLogResponseDto> dtos = resultLogs.stream()
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
                .collect(Collectors.toList());

        String nextCursor = null;
        if (hasNext && !resultLogs.isEmpty()) {
            com.project.tech_gadget_store.modules.auth.entity.LoginLog lastLog = resultLogs.get(resultLogs.size() - 1);
            nextCursor = com.project.tech_gadget_store.common.util.CursorUtil.encodeCursor(lastLog.getLoginTime(), lastLog.getId());
        }

        return new com.project.tech_gadget_store.common.dto.CursorPageResponseDto<>(dtos, nextCursor, hasNext);
    }
}
