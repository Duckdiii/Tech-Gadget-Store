package com.project.tech_gadget_store.modules.order.controller;

import com.project.tech_gadget_store.common.dto.CursorPageResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderCountResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderHistoryResponseDto;
import com.project.tech_gadget_store.modules.order.dto.response.OrderListStatsDto;
import com.project.tech_gadget_store.modules.order.service.OrderService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/manager/orders")
public class ManagerOrderController {

    private final OrderService orderService;

    public ManagerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/count")
    public ResponseEntity<OrderCountResponseDto> countManagerOrders(
            @RequestParam String startDate, @RequestParam String endDate) {
        return ResponseEntity.ok(orderService.countOrdersByDateRange(startDate, endDate));
    }

    @GetMapping("/pending-count")
    public ResponseEntity<OrderCountResponseDto> countPendingOrders() {
        return ResponseEntity.ok(orderService.countPendingOrders());
    }

    @GetMapping("/stats")
    public ResponseEntity<OrderListStatsDto> getManagerOrderStats() {
        return ResponseEntity.ok(orderService.getManagerOrderStats());
    }

    @GetMapping
    public ResponseEntity<CursorPageResponseDto<OrderHistoryResponseDto>> getManagerOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(orderService.getManagerOrders(
                status, search, startDate, endDate, paymentMethod, cursor, limit));
    }

    @PostMapping("/bulk-confirm")
    public ResponseEntity<Map<String, Object>> bulkConfirmOrders(@RequestBody List<String> orderIds) {
        return ResponseEntity.ok(orderService.bulkConfirmOrders(orderIds));
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportOrdersToCsv(@RequestBody List<String> orderIds) {
        String csv = orderService.exportOrdersToCsv(orderIds);
        byte[] data = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=van-don-hang-loat.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderHistoryResponseDto> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, body.get("status")));
    }
}
