package com.project.tech_gadget_store.modules.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.modules.auth.dto.response.BackupMetadata;
import com.project.tech_gadget_store.modules.auth.entity.AuditLog;
import com.project.tech_gadget_store.modules.auth.repository.AuditLogRepository;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Uses a real {@code @TempDir} (not a mocked filesystem) because the class under test is
 * fundamentally about file/zip/checksum manipulation — mocking that away would test nothing.
 * {@link JdbcTemplate} is mocked since the actual table contents are irrelevant to backup/restore
 * plumbing correctness.
 */
@ExtendWith(MockitoExtension.class)
class BackupAndRestoreServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;
    @Mock
    private AuditLogRepository auditLogRepository;

    @TempDir
    private Path backupDir;

    private BackupAndRestoreService service;

    @BeforeEach
    void setUp() {
        service = new BackupAndRestoreService(
                jdbcTemplate, auditLogRepository, new DatabaseSnapshotService(jdbcTemplate), backupDir.toString());
    }

    // -------------------------------------------------------------------------
    // Maintenance mode
    // -------------------------------------------------------------------------

    @Test
    void maintenanceMode_defaultsFalse_andCanBeToggled() {
        assertThat(service.isMaintenanceMode()).isFalse();

        service.setMaintenanceMode(true);
        assertThat(service.isMaintenanceMode()).isTrue();

        service.setMaintenanceMode(false);
        assertThat(service.isMaintenanceMode()).isFalse();
    }

    // -------------------------------------------------------------------------
    // getActiveRecoveryPoints
    // -------------------------------------------------------------------------

    @Test
    void getActiveRecoveryPoints_emptyDirectory_returnsEmptyList() {
        assertThat(service.getActiveRecoveryPoints()).isEmpty();
    }

    @Test
    void getActiveRecoveryPoints_skipsCorruptZipFiles_insteadOfThrowing() throws Exception {
        Files.writeString(backupDir.resolve("not-a-real-zip.zip"), "garbage content");

        assertThat(service.getActiveRecoveryPoints()).isEmpty();
    }

    @Test
    void getActiveRecoveryPoints_afterCreateBackup_listsItWithSize() {
        BackupMetadata created = service.createBackup("admin", "manual backup");

        List<BackupMetadata> points = service.getActiveRecoveryPoints();

        assertThat(points).hasSize(1);
        assertThat(points.get(0).getBackupName()).isEqualTo(created.getBackupName());
        assertThat(points.get(0).getSizeBytes()).isPositive();
    }

    // -------------------------------------------------------------------------
    // createBackup
    // -------------------------------------------------------------------------

    @Test
    void createBackup_success_writesZipAndChecksumSidecarAndAuditLog() {
        BackupMetadata result = service.createBackup("admin", "manual backup");

        assertThat(result.getBackupName()).matches("backup_\\d{8}_\\d{6}\\.zip");
        assertThat(result.getAppVersion()).isEqualTo("1.0.0");
        assertThat(result.getChecksum()).isNotBlank();
        assertThat(result.getSizeBytes()).isPositive();

        assertThat(backupDir.resolve(result.getBackupName())).exists();
        assertThat(backupDir.resolve(result.getBackupName() + ".sha256")).exists();

        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(logCaptor.capture());
        assertThat(logCaptor.getValue().getAction()).isEqualTo("BACKUP");
        assertThat(logCaptor.getValue().getPerformedBy()).isEqualTo("admin");
    }

    @Test
    void createBackup_databaseReadFails_throwsRuntimeExceptionAndDoesNotRegisterAuditLog() {
        when(jdbcTemplate.queryForList(anyString())).thenThrow(new RuntimeException("DB connection lost"));

        assertThatThrownBy(() -> service.createBackup("admin", "manual backup"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Backup creation failed");

        verifyNoInteractions(auditLogRepository);
    }

    // -------------------------------------------------------------------------
    // restoreBackup — validation failures
    // -------------------------------------------------------------------------

    @Test
    void restoreBackup_pathTraversalBackupName_throwsIllegalArgumentException_andLeavesMaintenanceModeOff() {
        assertThatThrownBy(() -> service.restoreBackup("admin", "../../../etc/passwd", "FULL", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid backup name");

        assertThat(service.isMaintenanceMode()).isFalse();
        verify(auditLogRepository).save(argThat(log -> "RESTORE_FAILED".equals(log.getAction())));
    }

    @Test
    void restoreBackup_missingBackupFile_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> service.restoreBackup("admin", "does-not-exist.zip", "FULL", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("missing or corrupted");

        assertThat(service.isMaintenanceMode()).isFalse();
    }

    @Test
    void restoreBackup_checksumMismatch_throwsIllegalArgumentException() throws Exception {
        BackupMetadata created = service.createBackup("admin", "manual backup");
        // Corrupt the sidecar checksum so it no longer matches the zip's real SHA-256.
        Files.writeString(backupDir.resolve(created.getBackupName() + ".sha256"), "0000000000000000000000000000000000000000000000000000000000000000");

        assertThatThrownBy(() -> service.restoreBackup("admin", created.getBackupName(), "FULL", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("missing or corrupted");

        assertThat(service.isMaintenanceMode()).isFalse();
    }

    @Test
    void restoreBackup_incompatibleAppVersion_throwsIllegalStateException() throws Exception {
        String backupName = writeFakeBackup("incompatible.zip", "0.0.1");

        assertThatThrownBy(() -> service.restoreBackup("admin", backupName, "FULL", null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("incompatible");

        assertThat(service.isMaintenanceMode()).isFalse();
        verify(auditLogRepository).save(argThat(log -> "RESTORE_FAILED".equals(log.getAction())));
    }

    // -------------------------------------------------------------------------
    // restoreBackup — success and rollback
    // -------------------------------------------------------------------------

    @Test
    void restoreBackup_fullScope_success_deletesAndReinsertsRows() {
        when(jdbcTemplate.queryForList("SELECT * FROM audit_logs"))
                .thenReturn(List.of(Map.of("id", "log-1", "performed_by", "admin", "action", "BACKUP")));

        BackupMetadata created = service.createBackup("admin", "manual backup");

        service.restoreBackup("admin2", created.getBackupName(), "FULL", null);

        assertThat(service.isMaintenanceMode()).isFalse();
        verify(jdbcTemplate, atLeastOnce()).update(startsWith("DELETE FROM audit_logs"));
        verify(jdbcTemplate, atLeastOnce()).update(startsWith("INSERT INTO audit_logs"), any(Object[].class));
        verify(auditLogRepository).save(argThat(log -> "RESTORE".equals(log.getAction())));
    }

    @Test
    void restoreBackup_partialScopeWithNoModules_throwsIllegalArgumentException() {
        BackupMetadata created = service.createBackup("admin", "manual backup");

        assertThatThrownBy(() -> service.restoreBackup("admin", created.getBackupName(), "PARTIAL", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No modules selected");

        assertThat(service.isMaintenanceMode()).isFalse();
    }

    @Test
    void restoreBackup_unexpectedFailureDuringRestore_rollsBackAndRethrowsRuntimeException() {
        BackupMetadata created = service.createBackup("admin", "manual backup");
        // Force a failure that is neither IllegalArgumentException nor IllegalStateException,
        // to exercise the generic-failure / rollback-from-snapshot branch.
        when(jdbcTemplate.update(startsWith("DELETE FROM audit_logs")))
                .thenThrow(new RuntimeException("disk full"));

        assertThatThrownBy(() -> service.restoreBackup("admin", created.getBackupName(), "FULL", null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Restore process failed");

        assertThat(service.isMaintenanceMode()).isFalse();
        verify(auditLogRepository).save(argThat(log -> "RESTORE_FAILED".equals(log.getAction())));
        // Temporary snapshot must be cleaned up regardless of outcome.
        try (var files = Files.list(backupDir)) {
            assertThat(files.filter(p -> p.getFileName().toString().startsWith("temp_snapshot_"))).isEmpty();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Hand-crafts a valid-checksum backup zip whose metadata declares the given app version. */
    private String writeFakeBackup(String backupName, String appVersion) throws Exception {
        ObjectMapper mapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            BackupMetadata meta = BackupMetadata.builder()
                    .backupName(backupName)
                    .timestamp(LocalDateTime.now())
                    .appVersion(appVersion)
                    .checksum("")
                    .build();
            zos.putNextEntry(new ZipEntry("metadata.json"));
            zos.write(mapper.writeValueAsBytes(meta));
            zos.closeEntry();
        }
        byte[] zipBytes = baos.toByteArray();
        Path zipPath = backupDir.resolve(backupName);
        Files.write(zipPath, zipBytes);

        byte[] hash = MessageDigest.getInstance("SHA-256").digest(zipBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        Files.writeString(backupDir.resolve(backupName + ".sha256"), sb.toString());

        return backupName;
    }
}
