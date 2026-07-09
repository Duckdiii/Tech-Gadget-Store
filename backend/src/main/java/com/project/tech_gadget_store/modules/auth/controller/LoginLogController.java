package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.modules.auth.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.modules.auth.service.LoginLogService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/manager/login-logs")
public class LoginLogController {

    private final LoginLogService loginLogService;

    public LoginLogController(LoginLogService loginLogService) {
        this.loginLogService = loginLogService;
    }

    @GetMapping
    public ResponseEntity<com.project.tech_gadget_store.common.dto.CursorPageResponseDto<LoginLogResponseDto>> getAllLoginLogs(
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(loginLogService.getLoginLogsCursor(cursor, limit));
    }
}
