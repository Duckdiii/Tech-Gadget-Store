package com.project.tech_gadget_store.modules.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Reads and writes application database tables as JSON entries inside a backup zip. Owns the
 * table list, insertion order and the SQL-injection guard on identifiers coming from a backup
 * file; {@link BackupAndRestoreService} owns the surrounding workflow (file management, checksum,
 * maintenance mode, audit log, rollback) and doesn't know how a table is actually serialized.
 */
@Component
public class DatabaseSnapshotService {

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

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public DatabaseSnapshotService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
    }

    /** Writes one {@code <table>.json} zip entry per existing table, in {@link #TABLES_IN_ORDER}. */
    public void exportAllTables(ZipOutputStream zos) throws IOException {
        for (String tableName : TABLES_IN_ORDER) {
            if (tableExists(tableName)) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + tableName);
                writeZipEntry(zos, tableName + ".json", rows);
            }
        }
    }

    /** Reads every {@code <table>.json} entry (skipping {@code metadata.json}) from a backup zip. */
    public Map<String, List<Map<String, Object>>> readTablesFromZip(Path zipPath) throws Exception {
        Map<String, List<Map<String, Object>>> tablesData = new HashMap<>();
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
        return tablesData;
    }

    /** Resolves which tables a restore should touch: every table for FULL, or per selected module for PARTIAL. */
    public List<String> resolveTargetTables(String scope, List<String> modulesToRestore) {
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
        return targetTables;
    }

    /** Clears {@code targetTables} (reverse insertion order, to respect FK constraints) then reinserts {@code tablesData}. */
    public void restoreTables(Map<String, List<Map<String, Object>>> tablesData, List<String> targetTables) {
        List<String> reverseOrder = new ArrayList<>(TABLES_IN_ORDER);
        Collections.reverse(reverseOrder);
        for (String tableName : reverseOrder) {
            if (targetTables.contains(tableName) && tableExists(tableName)) {
                jdbcTemplate.update("DELETE FROM " + tableName);
            }
        }

        for (String tableName : TABLES_IN_ORDER) {
            if (targetTables.contains(tableName) && tablesData.containsKey(tableName)) {
                for (Map<String, Object> row : tablesData.get(tableName)) {
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
            // Validate column name to prevent SQL injection via crafted backup files
            validateIdentifier(entry.getKey());

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

    /**
     * Validates that a SQL identifier (table or column name) contains only
     * alphanumeric characters and underscores, preventing SQL injection via
     * crafted backup files.
     *
     * @param name the identifier to validate
     * @throws IllegalArgumentException if the identifier contains invalid characters
     */
    private void validateIdentifier(String name) {
        if (name == null || !name.matches("[a-zA-Z0-9_]+")) {
            throw new IllegalArgumentException("Invalid SQL identifier: " + name);
        }
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
            validateIdentifier(tableName);
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
}
