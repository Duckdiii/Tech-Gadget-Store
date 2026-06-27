package com.project.tech_gadget_store.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.dto.response.BackupMetadata;
import com.project.tech_gadget_store.entity.AuditLog;
import com.project.tech_gadget_store.repository.AuditLogRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BackupAndRestoreServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private BackupAndRestoreService backupAndRestoreService;

    private final Path backupDirectory = Paths.get("backups");

    @BeforeEach
    void setUp() throws IOException {
        Files.createDirectories(backupDirectory);
    }

    @AfterEach
    void tearDown() throws IOException {
        File[] files = backupDirectory.toFile().listFiles();
        if (files != null) {
            for (File file : files) {
                file.delete();
            }
        }
    }

    @Test
    void createBackup_Success() {
        doAnswer(inv -> null).when(jdbcTemplate).execute(anyString());
        when(jdbcTemplate.queryForList(anyString())).thenReturn(List.of(Map.of("id", "1", "name", "Test")));

        BackupMetadata meta = backupAndRestoreService.createBackup("manager-1", "Test Backup");

        assertNotNull(meta);
        assertNotNull(meta.getBackupName());
        assertEquals("1.0.0", meta.getAppVersion());
        assertFalse(meta.getChecksum().isEmpty());
        assertTrue(Files.exists(backupDirectory.resolve(meta.getBackupName())));

        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void restoreBackup_Success_FullScope() throws Exception {
        String backupName = "test_valid_backup.zip";
        Path backupPath = backupDirectory.resolve(backupName);
        createMockBackupFile(backupPath, "1.0.0");

        // Calculate and save MD5
        String correctMd5 = calculateMD5(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".md5"), correctMd5);

        doAnswer(inv -> null).when(jdbcTemplate).execute(anyString());
        when(jdbcTemplate.update(anyString())).thenReturn(1);
        when(jdbcTemplate.update(anyString(), any(Object[].class))).thenReturn(1);

        assertDoesNotThrow(() -> 
            backupAndRestoreService.restoreBackup("manager-1", backupName, "FULL", null)
        );

        assertFalse(backupAndRestoreService.isMaintenanceMode());
        verify(auditLogRepository, atLeastOnce()).save(any(AuditLog.class));
    }

    @Test
    void restoreBackup_MissingBackupFile_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", "non_existent.zip", "FULL", null)
        );
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void restoreBackup_IncompatibleVersion_ThrowsIllegalStateException() throws Exception {
        String backupName = "incompatible_backup.zip";
        Path backupPath = backupDirectory.resolve(backupName);
        createMockBackupFile(backupPath, "2.0.0");

        // Calculate and save MD5
        String correctMd5 = calculateMD5(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".md5"), correctMd5);

        assertThrows(IllegalStateException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", backupName, "FULL", null)
        );

        assertFalse(backupAndRestoreService.isMaintenanceMode());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void restoreBackup_CorruptedChecksum_ThrowsIllegalArgumentException() throws Exception {
        String backupName = "corrupted_checksum.zip";
        Path backupPath = backupDirectory.resolve(backupName);
        createMockBackupFile(backupPath, "1.0.0");

        // Save corrupted MD5
        Files.writeString(backupDirectory.resolve(backupName + ".md5"), "wrong_checksum_here");

        assertThrows(IllegalArgumentException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", backupName, "FULL", null)
        );

        assertFalse(backupAndRestoreService.isMaintenanceMode());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void restoreBackup_ExecutionFails_RollsBackToSnapshotAndThrowsRuntimeException() throws Exception {
        String backupName = "fail_during_restore.zip";
        Path backupPath = backupDirectory.resolve(backupName);
        createMockBackupFile(backupPath, "1.0.0");

        // Calculate and save MD5
        String correctMd5 = calculateMD5(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".md5"), correctMd5);

        doAnswer(inv -> null).when(jdbcTemplate).execute(anyString());

        // Throw exception when deleting during restore to trigger rollback
        when(jdbcTemplate.update(anyString())).thenThrow(new RuntimeException("Database connection lost during truncate"));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", backupName, "FULL", null)
        );

        assertTrue(ex.getMessage().contains("The previous stable state has been recovered"));
        assertFalse(backupAndRestoreService.isMaintenanceMode());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    private void createMockBackupFile(Path path, String version) throws Exception {
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(path.toFile()))) {
            zos.putNextEntry(new ZipEntry("products.json"));
            zos.write(objectMapper.writeValueAsBytes(List.of(Map.of("id", "1", "name", "Test Phone"))));
            zos.closeEntry();

            zos.putNextEntry(new ZipEntry("metadata.json"));
            BackupMetadata meta = BackupMetadata.builder()
                    .backupName(path.getFileName().toString())
                    .timestamp(LocalDateTime.now())
                    .appVersion(version)
                    .checksum("")
                    .build();
            zos.write(objectMapper.writeValueAsBytes(meta));
            zos.closeEntry();
        }
    }

    private String calculateMD5(Path path) throws Exception {
        byte[] data = Files.readAllBytes(path);
        byte[] hash = java.security.MessageDigest.getInstance("MD5").digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
