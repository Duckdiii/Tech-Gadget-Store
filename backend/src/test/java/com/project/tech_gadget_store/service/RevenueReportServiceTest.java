package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.RevenueReportFilterRequestDto;
import com.project.tech_gadget_store.dto.response.*;
import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.exception.RevenueReportLoadException;
import com.project.tech_gadget_store.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RevenueReportServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private RevenueReportService revenueReportService;

    private Order completedOrder1;
    private Order completedOrder2;
    private Order pendingOrder;

    private Category categoryPhone;
    private Category categoryLaptop;

    private Brand brandApple;
    private Brand brandDell;

    void setUpMocks() {
        // Categories & Brands
        categoryPhone = mock(Category.class);
        lenient().when(categoryPhone.getId()).thenReturn("cat-phone");
        lenient().when(categoryPhone.getName()).thenReturn("Phones");

        categoryLaptop = mock(Category.class);
        lenient().when(categoryLaptop.getId()).thenReturn("cat-laptop");
        lenient().when(categoryLaptop.getName()).thenReturn("Laptops");

        brandApple = mock(Brand.class);
        lenient().when(brandApple.getId()).thenReturn("brand-apple");
        lenient().when(brandApple.getName()).thenReturn("Apple");

        brandDell = mock(Brand.class);
        lenient().when(brandDell.getId()).thenReturn("brand-dell");
        lenient().when(brandDell.getName()).thenReturn("Dell");

        // Products
        Product iphone = mock(Product.class);
        lenient().when(iphone.getId()).thenReturn("prod-iphone");
        lenient().when(iphone.getName()).thenReturn("iPhone 15");
        lenient().when(iphone.getCategory()).thenReturn(categoryPhone);
        lenient().when(iphone.getBrand()).thenReturn(brandApple);

        Product macbook = mock(Product.class);
        lenient().when(macbook.getId()).thenReturn("prod-macbook");
        lenient().when(macbook.getName()).thenReturn("MacBook Air");
        lenient().when(macbook.getCategory()).thenReturn(categoryLaptop);
        lenient().when(macbook.getBrand()).thenReturn(brandApple);

        Product dellXps = mock(Product.class);
        lenient().when(dellXps.getId()).thenReturn("prod-dellxps");
        lenient().when(dellXps.getName()).thenReturn("Dell XPS 13");
        lenient().when(dellXps.getCategory()).thenReturn(categoryLaptop);
        lenient().when(dellXps.getBrand()).thenReturn(brandDell);

        // Product Variants
        ProductVariant iphoneVar = mock(ProductVariant.class);
        lenient().when(iphoneVar.getProduct()).thenReturn(iphone);

        ProductVariant macbookVar = mock(ProductVariant.class);
        lenient().when(macbookVar.getProduct()).thenReturn(macbook);

        ProductVariant dellVar = mock(ProductVariant.class);
        lenient().when(dellVar.getProduct()).thenReturn(dellXps);

        // Payment Methods
        MomoPaymentMethod momo = mock(MomoPaymentMethod.class);
        lenient().when(momo.getName()).thenReturn("Ví MoMo");

        VNPayPaymentMethod vnpay = mock(VNPayPaymentMethod.class);
        lenient().when(vnpay.getName()).thenReturn("VNPay");

        // Order Items
        OrderItem item1 = mock(OrderItem.class);
        lenient().when(item1.getProductVariant()).thenReturn(iphoneVar);
        lenient().when(item1.getQuantity()).thenReturn(2);
        lenient().when(item1.calculateTotal()).thenReturn(BigDecimal.valueOf(2000.00));

        OrderItem item2 = mock(OrderItem.class);
        lenient().when(item2.getProductVariant()).thenReturn(macbookVar);
        lenient().when(item2.getQuantity()).thenReturn(1);
        lenient().when(item2.calculateTotal()).thenReturn(BigDecimal.valueOf(1500.00));

        OrderItem item3 = mock(OrderItem.class);
        lenient().when(item3.getProductVariant()).thenReturn(dellVar);
        lenient().when(item3.getQuantity()).thenReturn(1);
        lenient().when(item3.calculateTotal()).thenReturn(BigDecimal.valueOf(1200.00));

        // Orders
        completedOrder1 = mock(Order.class);
        lenient().when(completedOrder1.getId()).thenReturn("order-1");
        lenient().when(completedOrder1.getOrderStatus()).thenReturn(OrderStatus.COMPLETED);
        // Order date = current month, day 15, 10:00
        LocalDateTime date1 = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).withDayOfMonth(15).withHour(10).withMinute(0);
        lenient().when(completedOrder1.getOrderDate()).thenReturn(date1);
        lenient().when(completedOrder1.getSelectedPaymentMethod()).thenReturn(momo);
        lenient().when(completedOrder1.getItems()).thenReturn(List.of(item1, item2));

        completedOrder2 = mock(Order.class);
        lenient().when(completedOrder2.getId()).thenReturn("order-2");
        lenient().when(completedOrder2.getOrderStatus()).thenReturn(OrderStatus.COMPLETED);
        // Order date = current month, day 16, 14:00
        LocalDateTime date2 = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).withDayOfMonth(16).withHour(14).withMinute(0);
        lenient().when(completedOrder2.getOrderDate()).thenReturn(date2);
        lenient().when(completedOrder2.getSelectedPaymentMethod()).thenReturn(vnpay);
        lenient().when(completedOrder2.getItems()).thenReturn(List.of(item3));

        pendingOrder = mock(Order.class);
        lenient().when(pendingOrder.getId()).thenReturn("order-3");
        lenient().when(pendingOrder.getOrderStatus()).thenReturn(OrderStatus.PROCESSING);
        lenient().when(pendingOrder.getOrderDate()).thenReturn(LocalDateTime.now());
        lenient().when(pendingOrder.getItems()).thenReturn(List.of(item1));
    }

    @Test
    void getRevenueReport_DefaultMonthly_Success() {
        setUpMocks();
        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1, completedOrder2, pendingOrder));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder().build(); // defaults to monthly
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertNull(report.getMessage());
        assertEquals(BigDecimal.valueOf(4700.00), report.getTotalRevenue()); // 2000 + 1500 + 1200
        assertEquals(2, report.getTotalOrders());

        // Category breakdown check
        assertEquals(2, report.getRevenueByCategory().size());
        assertEquals("Laptops", report.getRevenueByCategory().get(0).getCategoryName());
        assertEquals(BigDecimal.valueOf(2700.00), report.getRevenueByCategory().get(0).getRevenue()); // macbook 1500 + dell 1200
        assertEquals("Phones", report.getRevenueByCategory().get(1).getCategoryName());
        assertEquals(BigDecimal.valueOf(2000.00), report.getRevenueByCategory().get(1).getRevenue()); // iphone 2000

        // Brand breakdown check
        assertEquals(2, report.getRevenueByBrand().size());
        assertEquals("Apple", report.getRevenueByBrand().get(0).getBrandName());
        assertEquals(BigDecimal.valueOf(3500.00), report.getRevenueByBrand().get(0).getRevenue()); // 2000 + 1500
        assertEquals("Dell", report.getRevenueByBrand().get(1).getBrandName());
        assertEquals(BigDecimal.valueOf(1200.00), report.getRevenueByBrand().get(1).getRevenue());

        // Top Selling Products
        assertEquals(3, report.getTopSellingProducts().size());
        assertEquals("iPhone 15", report.getTopSellingProducts().get(0).getProductName());
        assertEquals(2, report.getTopSellingProducts().get(0).getQuantitySold());
    }

    @Test
    void getRevenueReport_DailyTrend_Success() {
        setUpMocks();
        // Adjust completedOrder1 date to today at 10:00
        LocalDateTime date1 = LocalDateTime.now().withHour(10).withMinute(0);
        lenient().when(completedOrder1.getOrderDate()).thenReturn(date1);

        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .period("DAILY")
                .build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(1, report.getTotalOrders());
        assertEquals(BigDecimal.valueOf(3500.00), report.getTotalRevenue());

        // Trend is hourly (24 points)
        assertNotNull(report.getTrend());
        assertEquals(24, report.getTrend().size());
        assertEquals("10:00", report.getTrend().get(10).getLabel());
        assertEquals(BigDecimal.valueOf(3500.00), report.getTrend().get(10).getRevenue());
    }

    @Test
    void getRevenueReport_WeeklyTrend_Success() {
        setUpMocks();
        // Adjust completedOrder1 date to Monday of current week
        LocalDateTime date1 = LocalDateTime.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(8);
        lenient().when(completedOrder1.getOrderDate()).thenReturn(date1);

        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .period("WEEKLY")
                .build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(BigDecimal.valueOf(3500.00), report.getTotalRevenue());
    }

    @Test
    void getRevenueReport_CustomRange_Success() {
        setUpMocks();
        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1, completedOrder2));

        String startStr = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).plusDays(10).toString();
        String endStr = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).plusDays(20).toString();

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .period("CUSTOM")
                .startDate(startStr)
                .endDate(endStr)
                .build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(2, report.getTotalOrders());
    }

    @Test
    void getRevenueReport_FilterByCategory_Success() {
        setUpMocks();
        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1, completedOrder2));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .categoryId("cat-phone")
                .build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(BigDecimal.valueOf(2000.00), report.getTotalRevenue()); // Only iphone
        assertEquals(1, report.getTotalOrders());
        assertEquals(1, report.getRevenueByCategory().size());
        assertEquals("Phones", report.getRevenueByCategory().get(0).getCategoryName());
    }

    @Test
    void getRevenueReport_FilterByBrand_Success() {
        setUpMocks();
        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1, completedOrder2));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .brandId("brand-dell")
                .build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(BigDecimal.valueOf(1200.00), report.getTotalRevenue()); // Only Dell XPS 13
        assertEquals(1, report.getTotalOrders());
    }

    @Test
    void getRevenueReport_FilterByPaymentMethod_Success() {
        setUpMocks();
        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1, completedOrder2));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .paymentMethod("MOMO")
                .build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(BigDecimal.valueOf(3500.00), report.getTotalRevenue()); // Only completedOrder1 (momo)
        assertEquals(1, report.getTotalOrders());
    }

    @Test
    void getRevenueReport_InvalidDateOrder_ThrowsIllegalArgumentException() {
        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .period("CUSTOM")
                .startDate("2026-06-25")
                .endDate("2026-06-20")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> revenueReportService.getRevenueReport(filter));
        assertEquals("Invalid filter input. Please check your search criteria", ex.getMessage());
    }

    @Test
    void getRevenueReport_InvalidDateFormat_ThrowsIllegalArgumentException() {
        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder()
                .period("CUSTOM")
                .startDate("invalid-date")
                .endDate("2026-06-20")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> revenueReportService.getRevenueReport(filter));
        assertEquals("Invalid filter input. Please check your search criteria", ex.getMessage());
    }

    @Test
    void getRevenueReport_NoCompletedOrders_ReturnsZeroFiguresWithMessage() {
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder().build();
        RevenueReportResponseDto report = revenueReportService.getRevenueReport(filter);

        assertNotNull(report);
        assertEquals(BigDecimal.ZERO, report.getTotalRevenue());
        assertEquals(0, report.getTotalOrders());
        assertEquals("No revenue data found for the selected period", report.getMessage());
        assertTrue(report.getTrend().isEmpty());
    }

    @Test
    void getRevenueReport_DatabaseError_ThrowsRevenueReportLoadException() {
        when(orderRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder().build();

        RevenueReportLoadException ex = assertThrows(RevenueReportLoadException.class,
                () -> revenueReportService.getRevenueReport(filter));
        assertEquals("Unable to load report data. Please try again later.", ex.getMessage());
    }

    @Test
    void exportRevenueReportToCsv_Success() {
        setUpMocks();
        when(orderRepository.findAll()).thenReturn(List.of(completedOrder1, completedOrder2));

        RevenueReportFilterRequestDto filter = RevenueReportFilterRequestDto.builder().build();
        String csv = revenueReportService.exportRevenueReportToCsv(filter);

        assertNotNull(csv);
        assertTrue(csv.contains("REVENUE REPORT SUMMARY"));
        assertTrue(csv.contains("Total Revenue,4700.0"));
        assertTrue(csv.contains("REVENUE TREND"));
        assertTrue(csv.contains("REVENUE BY PRODUCT CATEGORY"));
        assertTrue(csv.contains("TOP 5 BEST-SELLING PRODUCTS"));
    }
}
