package com.project.tech_gadget_store.common.util;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.common.entity.BaseEntity;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.function.Function;


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

    /** Decodes a cursor token, defaulting to "start from the beginning" (null timestamp/id) when absent or invalid. */
    public static DecodedCursor decodeCursorOrStart(String cursorStr) {
        DecodedCursor decoded = decodeCursor(cursorStr);
        return decoded != null ? decoded : new DecodedCursor(null, null);
    }

    /**
     * Builds a cursor-paginated response from rows fetched with a "limit + 1" query: detects
     * {@code hasNext}, trims the extra row, and encodes the next cursor from the last kept row.
     * Shared by every cursor-paginated list endpoint (orders, payment logs, warehouse logs,
     * supply orders, login logs...) so each service doesn't reimplement this bookkeeping.
     *
     * @param rows fetched with page size {@code limit + 1}
     * @param timestampFn extracts the per-row timestamp the cursor is ordered on (e.g. order date,
     *     created-at) — callers differ on which field that is, so it can't be inferred generically
     */
    public static <E extends BaseEntity, T> CursorPageResponseDto<T> paginate(
            List<E> rows, int limit, Function<E, LocalDateTime> timestampFn, Function<E, T> mapper) {
        boolean hasNext = rows.size() > limit;
        List<E> resultRows = hasNext ? rows.subList(0, limit) : rows;
        List<T> items = resultRows.stream().map(mapper).toList();

        String nextCursor = null;
        if (hasNext && !resultRows.isEmpty()) {
            E last = resultRows.get(resultRows.size() - 1);
            nextCursor = encodeCursor(timestampFn.apply(last), last.getId());
        }

        return new CursorPageResponseDto<>(items, nextCursor, hasNext);
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
