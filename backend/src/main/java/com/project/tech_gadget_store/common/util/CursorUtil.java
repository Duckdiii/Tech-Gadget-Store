package com.project.tech_gadget_store.common.util;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;


public class CursorUtil {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static String encodeCursor(LocalDateTime timestamp, String id) {
        if (timestamp == null || id == null) {
            return null;
        }
        String raw = timestamp.format(FORMATTER) + "_" + id;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public static DecodedCursor decodeCursor(String cursorStr) {
        if (cursorStr == null || cursorStr.isBlank()) {
            return null;
        }
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(cursorStr);
            String raw = new String(decodedBytes, StandardCharsets.UTF_8);
            int underscoreIdx = raw.indexOf('_');
            if (underscoreIdx != -1) {
                String timestampStr = raw.substring(0, underscoreIdx);
                String id = raw.substring(underscoreIdx + 1);
                LocalDateTime timestamp = LocalDateTime.parse(timestampStr, FORMATTER);
                return new DecodedCursor(timestamp, id);
            }
        } catch (Exception e) {
            // Ignore invalid cursor format, return null to start from page 1
        }
        return null;
    }

    public static class DecodedCursor {
        private final LocalDateTime timestamp;
        private final String id;

        public DecodedCursor(LocalDateTime timestamp, String id) {
            this.timestamp = timestamp;
            this.id = id;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public String getId() {
            return id;
        }
    }
}
