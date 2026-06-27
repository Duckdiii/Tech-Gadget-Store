package com.project.tech_gadget_store.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tech_gadget_store.dto.response.BackupMetadata;
import com.project.tech_gadget_store.entity.AuditLog;
import com.project.tech_gadget_store.repository.AuditLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
public class BackupAndRestoreService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final AuditLogRepository auditLogRepository;

    private volatile boolean maintenanceMode = false;
    private static final String APP_VERSION = "1.0.0";
    private final Path backupDirectory = Paths.get("backups");

    private static final List<String> TABLES_IN_ORDER = List.of(
        "audit_logs",
        "notifications",
        "favorite_products",
        "cart_items",
        "carts",
        "order_items",
        "orders",
        "export_log_items",
        "export_logs",
        "import_log_items",
        "import_logs",
        "receipts",
        "product_variants",
        "product_images",
        "products",
        "brands",
        "categories",
        "accounts",
        "addresses",
        "customers",
        "staff",
        "managers",
        "users",
        "memberships",
        "promotions",
        "payment_logs",
        "payment_methods"
    );

    public BackupAndRestoreService(JdbcTemplate jdbcTemplate, AuditLogRepository auditLogRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        this.auditLogRepository = auditLogRepository;
        try {
            Files.createDirectories(backupDirectory);
        } catch (IOException e) {
            log.error("Failed to create backup directory", e);
        }
    }

    public boolean isMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
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
                // 1. Export all tables in order
                for (String tableName : TABLES_IN_ORDER) {
                    if (tableExists(tableName)) {
                        List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + tableName);
                        writeZipEntry(zos, tableName + ".json", rows);
                    }
                }
                
                // 2. Write metadata
                BackupMetadata meta = BackupMetadata.builder()
                        .backupName(backupName)
                        .timestamp(LocalDateTime.now())
                        .appVersion(APP_VERSION)
                        .checksum("")
                        .build();
                writeZipEntry(zos, "metadata.json", meta);
            }

            // Save zip file
            byte[] zipBytes = baos.toByteArray();
            Files.write(backupPath, zipBytes);

            // Compute MD5 of the final zip file
            String md5 = calculateMD5(backupPath);
            
            // Save MD5 to external file
            Path md5Path = backupDirectory.resolve(backupName + ".md5");
            Files.writeString(md5Path, md5);

            AuditLog logEntry = new AuditLog(performedBy, "BACKUP", "Created backup successfully: " + backupName + " (Reason: " + reason + ")");
            auditLogRepository.save(logEntry);

            return BackupMetadata.builder()
                    .backupName(backupName)
                    .timestamp(LocalDateTime.now())
                    .appVersion(APP_VERSION)
                    .checksum(md5)
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
            Path backupPath = backupDirectory.resolve(backupName);
            if (!Files.exists(backupPath)) {
                throw new IllegalArgumentException("The selected backup file is missing or corrupted. Please choose another recovery point");
            }

            // 1. Verify Backup Checksum using external .md5 file
            Path md5Path = backupDirectory.resolve(backupName + ".md5");
            if (!Files.exists(md5Path)) {
                throw new IllegalArgumentException("The selected backup file is missing or corrupted. Please choose another recovery point");
            }
            String expectedMd5 = Files.readString(md5Path).trim();
            String fileChecksum = calculateMD5(backupPath);
            if (!fileChecksum.equalsIgnoreCase(expectedMd5)) {
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
            for (String tableName : TABLES_IN_ORDER) {
                if (tableExists(tableName)) {
                    List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + tableName);
                    writeZipEntry(zos, tableName + ".json", rows);
                }
            }
            BackupMetadata meta = BackupMetadata.builder()
                    .backupName(path.getFileName().toString())
                    .timestamp(LocalDateTime.now())
                    .appVersion(APP_VERSION)
                    .checksum("")
                    .build();
            writeZipEntry(zos, "metadata.json", meta);
        }
        Files.write(path, baos.toByteArray());
    }

    private void executeRestoreFromZip(Path zipPath, String scope, List<String> modulesToRestore) throws Exception {
        Map<String, List<Map<String, Object>>> tablesData = new HashMap<>();
        
        // Read data from zip
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipPath.toFile()))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                if (name.endsWith(".json") && !name.equals("metadata.json")) {
                    String tableName = name.substring(0, name.length() - 5);
                    
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        bos.write(buffer, 0, len);
                    }
                    
                    List<Map<String, Object>> rows = objectMapper.readValue(bos.toByteArray(), new TypeReference<List<Map<String, Object>>>() {});
                    tablesData.put(tableName, rows);
                }
                zis.closeEntry();
            }
        }

        // Determine which tables to clear and restore
        List<String> targetTables = new ArrayList<>();
        if ("FULL".equalsIgnoreCase(scope)) {
            targetTables.addAll(TABLES_IN_ORDER);
        } else { // PARTIAL
            if (modulesToRestore == null || modulesToRestore.isEmpty()) {
                throw new IllegalArgumentException("No modules selected for partial restore");
            }
            for (String module : modulesToRestore) {
                if ("PRODUCTS".equalsIgnoreCase(module)) {
                    targetTables.addAll(List.of("product_variants", "product_images", "products", "brands", "categories"));
                } else if ("CUSTOMERS".equalsIgnoreCase(module)) {
                    targetTables.addAll(List.of("customers", "users", "addresses", "carts", "cart_items"));
                } else if ("ORDERS".equalsIgnoreCase(module)) {
                    targetTables.addAll(List.of("order_items", "orders"));
                }
            }
        }

        // Clear target tables in reverse order to respect foreign key constraints
        List<String> reverseOrder = new ArrayList<>(TABLES_IN_ORDER);
        Collections.reverse(reverseOrder);
        for (String tableName : reverseOrder) {
            if (targetTables.contains(tableName) && tableExists(tableName)) {
                jdbcTemplate.update("DELETE FROM " + tableName);
            }
        }

        // Restore target tables in correct topological order
        for (String tableName : TABLES_IN_ORDER) {
            if (targetTables.contains(tableName) && tablesData.containsKey(tableName)) {
                List<Map<String, Object>> rows = tablesData.get(tableName);
                for (Map<String, Object> row : rows) {
                    insertRow(tableName, row);
                }
            }
        }
    }

    private void insertRow(String tableName, Map<String, Object> row) {
        if (row.isEmpty()) return;

        StringBuilder columns = new StringBuilder();
        StringBuilder placeholders = new StringBuilder();
        List<Object> values = new ArrayList<>();

        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (columns.length() > 0) {
                columns.append(", ");
                placeholders.append(", ");
            }
            columns.append(entry.getKey());
            placeholders.append("?");
            values.add(convertValueIfNeeded(entry.getKey(), entry.getValue()));
        }

        String sql = "INSERT INTO " + tableName + " (" + columns + ") VALUES (" + placeholders + ")";
        jdbcTemplate.update(sql, values.toArray());
    }

    private Object convertValueIfNeeded(String columnName, Object value) {
        if (value instanceof String && (columnName.endsWith("_at") || columnName.equals("timestamp") || columnName.endsWith("_date"))) {
            try {
                String str = (String) value;
                return LocalDateTime.parse(str);
            } catch (Exception e) {
                return value;
            }
        }
        return value;
    }

    private boolean tableExists(String tableName) {
        try {
            jdbcTemplate.execute("SELECT 1 FROM " + tableName + " LIMIT 1");
            return true;
        } catch (Exception e) {
            return false;
        }
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

    private String calculateMD5(Path path) throws Exception {
        byte[] data = Files.readAllBytes(path);
        byte[] hash = MessageDigest.getInstance("MD5").digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
