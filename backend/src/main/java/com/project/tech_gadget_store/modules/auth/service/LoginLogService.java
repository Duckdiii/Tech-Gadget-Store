package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.util.CursorUtil;
import com.project.tech_gadget_store.modules.auth.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.LoginLog;
import com.project.tech_gadget_store.modules.auth.repository.LoginLogRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    public Page<LoginLogResponseDto> getLoginLogsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
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

    public CursorPageResponseDto<LoginLogResponseDto> getLoginLogsCursor(String cursor, int limit) {
        CursorUtil.DecodedCursor decoded = CursorUtil.decodeCursorOrStart(cursor);

        Pageable pageable = PageRequest.of(0, limit + 1);
        List<LoginLog> logs = loginLogRepository.findLoginLogsCursor(
                decoded.getTimestamp(), decoded.getId(), pageable);

        return CursorUtil.paginate(logs, limit, LoginLog::getLoginTime, log -> LoginLogResponseDto.builder()
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
}
