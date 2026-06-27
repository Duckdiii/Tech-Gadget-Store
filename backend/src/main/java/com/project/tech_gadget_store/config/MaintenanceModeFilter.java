package com.project.tech_gadget_store.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.service.BackupAndRestoreService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@Order(1)
public class MaintenanceModeFilter extends OncePerRequestFilter {

    private final BackupAndRestoreService backupAndRestoreService;
    private final ObjectMapper objectMapper;

    public MaintenanceModeFilter(BackupAndRestoreService backupAndRestoreService) {
        this.backupAndRestoreService = backupAndRestoreService;
        this.objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (backupAndRestoreService.isMaintenanceMode() && !path.startsWith("/api/manager/backup-restore")) {
            response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            Map<String, String> error = Map.of(
                    "error", "Service Unavailable",
                    "message", "The application is currently in maintenance mode due to a backup/restore operation."
            );

            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
