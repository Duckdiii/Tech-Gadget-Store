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
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
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

    @Mock
    private StringRedisTemplate redis;

    @Mock
    private ValueOperations<String, String> valueOps;

    @InjectMocks
    private BackupAndRestoreService backupAndRestoreService;

    private final Path backupDirectory = Paths.get("backups");

    @BeforeEach
    void setUp() throws IOException {
        Files.createDirectories(backupDirectory);
        when(redis.opsForValue()).thenReturn(valueOps);
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

        // Calculate and save SHA-256
        String correctMd5 = calculateSHA256(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".sha256"), correctMd5);

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

        // Calculate and save SHA-256
        String correctMd5 = calculateSHA256(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".sha256"), correctMd5);

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

        // Save corrupted checksum
        Files.writeString(backupDirectory.resolve(backupName + ".sha256"), "wrong_checksum_here");

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

        // Calculate and save SHA-256
        String correctMd5 = calculateSHA256(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".sha256"), correctMd5);

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

    @Test
    void restoreBackup_PathTraversal_ThrowsIllegalArgumentException() {
        String unsafeBackupName = "../../../etc/passwd";
        
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", unsafeBackupName, "FULL", null)
        );

        assertEquals("Invalid backup name", ex.getMessage());
        assertFalse(backupAndRestoreService.isMaintenanceMode());
        verify(auditLogRepository).save(any(AuditLog.class));
    }


    // -------------------------------------------------------------------------
    // SQL Injection via crafted column names in backup ZIP
    // -------------------------------------------------------------------------

    @Test
    void restoreBackup_MaliciousColumnNameInZip_ThrowsIllegalArgumentException() throws Exception {
        String backupName = "malicious_columns.zip";
        Path backupPath = backupDirectory.resolve(backupName);
        // Build a ZIP where the JSON row contains a column name with SQL injection payload
        createMockBackupFileWithColumn(backupPath, "1.0.0", "id; DROP TABLE users; --", "1");

        String correctMd5 = calculateSHA256(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".sha256"), correctMd5);

        doAnswer(inv -> null).when(jdbcTemplate).execute(anyString());
        // DELETE is called before INSERT — let it pass so we reach insertRow()
        when(jdbcTemplate.update(anyString())).thenReturn(1);

        assertThrows(IllegalArgumentException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", backupName, "FULL", null)
        );
    }

    @Test
    void restoreBackup_ColumnNameWithSpace_ThrowsIllegalArgumentException() throws Exception {
        String backupName = "space_in_column.zip";
        Path backupPath = backupDirectory.resolve(backupName);
        createMockBackupFileWithColumn(backupPath, "1.0.0", "column name", "value");

        String correctMd5 = calculateSHA256(backupPath);
        Files.writeString(backupDirectory.resolve(backupName + ".sha256"), correctMd5);

        doAnswer(inv -> null).when(jdbcTemplate).execute(anyString());
        when(jdbcTemplate.update(anyString())).thenReturn(1);

        assertThrows(IllegalArgumentException.class, () ->
            backupAndRestoreService.restoreBackup("manager-1", backupName, "FULL", null)
        );
    }

    /** Creates a backup ZIP whose products.json row uses a custom (potentially malicious) column name. */
    private void createMockBackupFileWithColumn(Path path, String version, String columnName, String columnValue) throws Exception {
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(path.toFile()))) {
            zos.putNextEntry(new ZipEntry("products.json"));
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put(columnName, columnValue);
            zos.write(objectMapper.writeValueAsBytes(List.of(row)));
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

    private String calculateSHA256(Path path) throws Exception {
        byte[] data = Files.readAllBytes(path);
        byte[] hash = java.security.MessageDigest.getInstance("SHA-256").digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
