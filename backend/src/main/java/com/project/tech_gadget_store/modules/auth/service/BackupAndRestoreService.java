package com.project.tech_gadget_store.modules.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.modules.auth.dto.response.BackupMetadata;
import com.project.tech_gadget_store.modules.auth.entity.AuditLog;
import com.project.tech_gadget_store.modules.auth.repository.AuditLogRepository;
import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



/**
 * Orchestrates backup/restore: file management, checksum verification, maintenance-mode
 * switching, audit logging and rollback-on-failure. Delegates the actual table export/import
 * (what to read/write and in what order) to {@link DatabaseSnapshotService}.
 */
@Slf4j
@Service
public class BackupAndRestoreService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final AuditLogRepository auditLogRepository;
    private final DatabaseSnapshotService databaseSnapshotService;
    private final AtomicBoolean maintenanceMode = new AtomicBoolean(false);

    private static final String APP_VERSION = "1.0.0";
    private final Path backupDirectory;

    public BackupAndRestoreService(JdbcTemplate jdbcTemplate,
                                   AuditLogRepository auditLogRepository,
                                   DatabaseSnapshotService databaseSnapshotService,
                                   @Value("${app.backup.directory:backups}") String backupDirectory) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        this.auditLogRepository = auditLogRepository;
        this.databaseSnapshotService = databaseSnapshotService;
        this.backupDirectory = Paths.get(backupDirectory);
        try {
            Files.createDirectories(this.backupDirectory);
        } catch (IOException e) {
            log.error("Failed to create backup directory", e);
        }
    }

    public boolean isMaintenanceMode() {
        return maintenanceMode.get();
    }

    public void setMaintenanceMode(boolean enabled) {
        maintenanceMode.set(enabled);
    }

    public List<BackupMetadata> getActiveRecoveryPoints() {
        List<BackupMetadata> recoveryPoints = new ArrayList<>();
        File[] files = backupDirectory.toFile().listFiles((dir, name) -> name.endsWith(".zip"));
        if (files == null) return recoveryPoints;

        for (File file : files) {
            try {
                BackupMetadata meta = readMetadataFromZip(file.toPath());
                if (meta != null) {
                    meta.setSizeBytes(file.length());
                    recoveryPoints.add(meta);
                }
            } catch (Exception e) {
                log.warn("Failed to read metadata from backup: {}", file.getName(), e);
            }
        }
        recoveryPoints.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return recoveryPoints;
    }

    @Transactional
    public BackupMetadata createBackup(String performedBy, String reason) {
        String timestampStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String backupName = "backup_" + timestampStr + ".zip";
        Path backupPath = backupDirectory.resolve(backupName);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ZipOutputStream zos = new ZipOutputStream(baos)) {
                databaseSnapshotService.exportAllTables(zos);
                writeZipEntry(zos, "metadata.json", BackupMetadata.builder()
                        .backupName(backupName)
                        .timestamp(LocalDateTime.now())
                        .appVersion(APP_VERSION)
                        .checksum("")
                        .build());
            }

            // Save zip file
            byte[] zipBytes = baos.toByteArray();
            Files.write(backupPath, zipBytes);

            // Compute SHA-256 of the final zip file
            String checksum = calculateSHA256(backupPath);

            // Save checksum to external file
            Path checksumPath = backupDirectory.resolve(backupName + ".sha256");
            Files.writeString(checksumPath, checksum);

            AuditLog logEntry = new AuditLog(performedBy, "BACKUP", "Created backup successfully: " + backupName + " (Reason: " + reason + ")");
            auditLogRepository.save(logEntry);

            return BackupMetadata.builder()
                    .backupName(backupName)
                    .timestamp(LocalDateTime.now())
                    .appVersion(APP_VERSION)
                    .checksum(checksum)
                    .sizeBytes(backupPath.toFile().length())
                    .build();

        } catch (Exception e) {
            log.error("Backup creation failed", e);
            throw new RuntimeException("Backup creation failed", e);
        }
    }

    public void restoreBackup(String performedBy, String backupName, String scope, List<String> modules) {
        // Put application in maintenance mode
        setMaintenanceMode(true);
        log.info("System placed into maintenance mode for restore operation.");

        Path snapshotPath = null;
        try {
            Path backupPath = backupDirectory.resolve(backupName).normalize();
            if (!backupPath.toAbsolutePath().normalize().startsWith(backupDirectory.toAbsolutePath().normalize())) {
                throw new IllegalArgumentException("Invalid backup name");
            }
            if (!Files.exists(backupPath)) {
                throw new IllegalArgumentException("The selected backup file is missing or corrupted. Please choose another recovery point");
            }

            // 1. Verify Backup Checksum using external .sha256 file
            Path checksumPath = backupDirectory.resolve(backupName + ".sha256").normalize();
            if (!checksumPath.toAbsolutePath().normalize().startsWith(backupDirectory.toAbsolutePath().normalize())) {
                throw new IllegalArgumentException("Invalid backup name");
            }
            if (!Files.exists(checksumPath)) {
                throw new IllegalArgumentException("The selected backup file is missing or corrupted. Please choose another recovery point");
            }
            String expectedChecksum = Files.readString(checksumPath).trim();
            String fileChecksum = calculateSHA256(backupPath);
            if (!fileChecksum.equalsIgnoreCase(expectedChecksum)) {
                throw new IllegalArgumentException("The selected backup file is missing or corrupted. Please choose another recovery point");
            }

            BackupMetadata meta = readMetadataFromZip(backupPath);
            if (meta == null) {
                throw new IllegalArgumentException("The selected backup file is missing or corrupted. Please choose another recovery point");
            }

            // Verify Compatibility
            if (!APP_VERSION.equals(meta.getAppVersion())) {
                throw new IllegalStateException("The restored backup is incompatible with the current application version");
            }

            // 2. Create Temporary Snapshot
            snapshotPath = backupDirectory.resolve("temp_snapshot_" + System.currentTimeMillis() + ".zip");
            createTemporarySnapshotFile(snapshotPath);
            log.info("Temporary recovery snapshot created: {}", snapshotPath.getFileName());

            // 3. Execute Restore
            executeRestoreFromZip(backupPath, scope, modules);

            // Record success in Audit Log
            AuditLog logEntry = new AuditLog(performedBy, "RESTORE", "Restored backup: " + backupName + " (Scope: " + scope + ")");
            auditLogRepository.save(logEntry);

            log.info("Restore completed successfully.");
        } catch (IllegalArgumentException e) {
            // Missing/invalid backup (Exception 4a) or Incompatible (Exception 4c)
            AuditLog logEntry = new AuditLog(performedBy, "RESTORE_FAILED", "Restore failed: " + e.getMessage());
            auditLogRepository.save(logEntry);
            throw e;
        } catch (IllegalStateException e) {
            // Incompatible version (Exception 4c)
            AuditLog logEntry = new AuditLog(performedBy, "RESTORE_FAILED", "Restore failed: " + e.getMessage());
            auditLogRepository.save(logEntry);
            throw e;
        } catch (Exception e) {
            log.error("Restore failed. Initiating rollback using temporary snapshot...", e);
            // Rollback from temporary snapshot (Exception 4b)
            if (snapshotPath != null && Files.exists(snapshotPath)) {
                try {
                    executeRestoreFromZip(snapshotPath, "FULL", null);
                    log.info("Rollback completed successfully. Previous stable state recovered.");
                } catch (Exception ex) {
                    log.error("Critical: Rollback from snapshot failed!", ex);
                }
            }
            AuditLog logEntry = new AuditLog(performedBy, "RESTORE_FAILED", "Restore failed: " + e.getMessage());
            auditLogRepository.save(logEntry);
            throw new RuntimeException("Restore process failed due to a system error. The previous stable state has been recovered", e);
        } finally {
            // Clean up temporary snapshot
            if (snapshotPath != null) {
                try {
                    Files.deleteIfExists(snapshotPath);
                } catch (IOException e) {
                    log.warn("Failed to delete temporary snapshot: {}", snapshotPath, e);
                }
            }
            // Return application to normal operation
            setMaintenanceMode(false);
            log.info("System returned to normal operation.");
        }
    }

    private void createTemporarySnapshotFile(Path path) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            databaseSnapshotService.exportAllTables(zos);
            writeZipEntry(zos, "metadata.json", BackupMetadata.builder()
                    .backupName(path.getFileName().toString())
                    .timestamp(LocalDateTime.now())
                    .appVersion(APP_VERSION)
                    .checksum("")
                    .build());
        }
        Files.write(path, baos.toByteArray());
    }

    private void executeRestoreFromZip(Path zipPath, String scope, List<String> modulesToRestore) throws Exception {
        Map<String, List<Map<String, Object>>> tablesData = databaseSnapshotService.readTablesFromZip(zipPath);
        List<String> targetTables = databaseSnapshotService.resolveTargetTables(scope, modulesToRestore);
        databaseSnapshotService.restoreTables(tablesData, targetTables);
    }

    private void writeZipEntry(ZipOutputStream zos, String entryName, Object data) throws IOException {
        zos.putNextEntry(new ZipEntry(entryName));
        zos.write(objectMapper.writeValueAsBytes(data));
        zos.closeEntry();
    }

    private BackupMetadata readMetadataFromZip(Path zipPath) throws Exception {
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipPath.toFile()))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("metadata.json".equals(entry.getName())) {
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        bos.write(buffer, 0, len);
                    }
                    return objectMapper.readValue(bos.toByteArray(), BackupMetadata.class);
                }
                zis.closeEntry();
            }
        }
        return null;
    }

    private String calculateSHA256(Path path) throws Exception {
        byte[] data = Files.readAllBytes(path);
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
