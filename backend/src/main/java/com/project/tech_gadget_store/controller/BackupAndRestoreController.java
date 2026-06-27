package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.RestoreRequestDto;
import com.project.tech_gadget_store.dto.response.BackupMetadata;
import com.project.tech_gadget_store.service.BackupAndRestoreService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/backup-restore")
public class BackupAndRestoreController {

    private final BackupAndRestoreService backupAndRestoreService;

    public BackupAndRestoreController(BackupAndRestoreService backupAndRestoreService) {
        this.backupAndRestoreService = backupAndRestoreService;
    }

    @GetMapping("/recovery-points")
    public ResponseEntity<List<BackupMetadata>> getRecoveryPoints() {
        return ResponseEntity.ok(backupAndRestoreService.getActiveRecoveryPoints());
    }

    @PostMapping("/backups")
    public ResponseEntity<BackupMetadata> createBackup(
            Principal principal,
            @RequestParam(defaultValue = "Manual Backup") String reason) {
        String username = principal != null ? principal.getName() : "ManagerAdmin";
        BackupMetadata meta = backupAndRestoreService.createBackup(username, reason);
        return ResponseEntity.ok(meta);
    }

    @PostMapping("/restores")
    public ResponseEntity<Map<String, String>> restoreBackup(
            Principal principal,
            @Valid @RequestBody RestoreRequestDto requestDto) {
        String username = principal != null ? principal.getName() : "ManagerAdmin";
        
        backupAndRestoreService.restoreBackup(
                username,
                requestDto.getBackupName(),
                requestDto.getScope(),
                requestDto.getModules()
        );
        
        return ResponseEntity.ok(Map.of(
                "message", "Restore operation completed successfully."
        ));
    }
}
