package com.project.tech_gadget_store.modules.warehouse.service;

import com.project.tech_gadget_store.common.exception.RevenueReportLoadException;
import com.project.tech_gadget_store.modules.catalog.dto.response.BrandRevenueDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.CategoryRevenueDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductSalesDto;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentMethodRevenueDto;
import com.project.tech_gadget_store.modules.payment.entity.CODPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.MomoPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.PaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.VNPayPaymentMethod;
import com.project.tech_gadget_store.modules.warehouse.dto.request.RevenueReportFilterRequestDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.RevenueReportResponseDto;
import com.project.tech_gadget_store.modules.warehouse.dto.response.RevenueTrendPointDto;
import com.project.tech_gadget_store.modules.warehouse.repository.ImportLogItemRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Slf4j
@Service
@Transactional(readOnly = true)
public class RevenueReportService {

    private final OrderRepository orderRepository;
    private final ImportLogItemRepository importLogItemRepository;

    public RevenueReportService(OrderRepository orderRepository, ImportLogItemRepository importLogItemRepository) {
        this.orderRepository = orderRepository;
        this.importLogItemRepository = importLogItemRepository;
    }

    public RevenueReportResponseDto getRevenueReport(RevenueReportFilterRequestDto filter) {
        LocalDateTime calculatedStart;
        LocalDateTime calculatedEnd = LocalDateTime.now().with(LocalTime.MAX);

        String period = (filter.getPeriod() != null) ? filter.getPeriod().trim().toUpperCase() : "MONTHLY";

        switch (period) {
            case "DAILY":
                calculatedStart = LocalDateTime.now().with(LocalTime.MIN);
                calculatedEnd = LocalDateTime.now().with(LocalTime.MAX);
                break;
            case "WEEKLY":
                // Start from Monday of the current week
                calculatedStart = LocalDateTime.now()
                        .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                        .with(LocalTime.MIN);
                break;
            case "MONTHLY":
                calculatedStart = LocalDateTime.now()
                        .with(TemporalAdjusters.firstDayOfMonth())
                        .with(LocalTime.MIN);
                break;
            case "CUSTOM":
                if (filter.getStartDate() == null || filter.getStartDate().isBlank() ||
                    filter.getEndDate() == null || filter.getEndDate().isBlank()) {
                    throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
                }
                try {
                    calculatedStart = LocalDate.parse(filter.getStartDate().trim()).atStartOfDay();
                    calculatedEnd = LocalDate.parse(filter.getEndDate().trim()).atTime(LocalTime.MAX);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
                }
                if (calculatedStart.isAfter(calculatedEnd)) {
                    throw new IllegalArgumentException("Invalid filter input. Please check your search criteria");
                }
                break;
            default:
                // Default is current month
                calculatedStart = LocalDateTime.now()
                        .with(TemporalAdjusters.firstDayOfMonth())
                        .with(LocalTime.MIN);
                break;
        }

        List<Order> orders;
        try {
            orders = orderRepository.findAll();
        } catch (Exception e) {
            log.error("Failed to retrieve orders from database", e);
            throw new RevenueReportLoadException("Unable to load report data. Please try again later.", e);
        }

        // Filter: Keep completed orders within the calculated date range
        final LocalDateTime finalStart = calculatedStart;
        final LocalDateTime finalEnd = calculatedEnd;
        List<Order> completedOrdersInRange = orders.stream()
                .filter(o -> OrderStatus.COMPLETED.equals(o.getOrderStatus()))
                .filter(o -> o.getOrderDate() != null &&
                        !o.getOrderDate().isBefore(finalStart) &&
                        !o.getOrderDate().isAfter(finalEnd))
                .collect(Collectors.toList());

        // Cancellation rate: cancelled/refunded vs. all orders placed in the same date range
        // (not just completed ones), since a cancelled order never reaches COMPLETED.
        List<Order> ordersInRange = orders.stream()
                .filter(o -> o.getOrderDate() != null &&
                        !o.getOrderDate().isBefore(finalStart) &&
                        !o.getOrderDate().isAfter(finalEnd))
                .collect(Collectors.toList());
        long cancelledOrRefundedCount = ordersInRange.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CANCELLED || o.getOrderStatus() == OrderStatus.REFUNDED)
                .count();
        Double cancellationRate = ordersInRange.isEmpty()
                ? 0.0
                : (cancelledOrRefundedCount * 100.0) / ordersInRange.size();

        // Average import cost per variant, for the top-profit-products report below.
        Map<String, BigDecimal> avgCostByVariantId = new HashMap<>();
        for (Object[] row : importLogItemRepository.findAverageImportPricePerVariant()) {
            String variantId = (String) row[0];
            Number avgPrice = (Number) row[1];
            avgCostByVariantId.put(variantId, BigDecimal.valueOf(avgPrice.doubleValue()));
        }

        // Process matching order items based on filters
        List<MatchedItem> matchedItems = new ArrayList<>();
        Set<String> distinctOrderIds = new HashSet<>();

        for (Order order : completedOrdersInRange) {
            // Apply payment method filter on Order level
            if (filter.getPaymentMethod() != null && !filter.getPaymentMethod().isBlank()) {
                String filterPm = filter.getPaymentMethod().trim();
                PaymentMethod pm = order.getSelectedPaymentMethod();
                String pmType = getPaymentMethodType(pm);
                String pmName = pm.getName();

                boolean typeMatches = pmType.equalsIgnoreCase(filterPm);
                boolean nameMatches = pmName != null && pmName.toLowerCase().contains(filterPm.toLowerCase());

                if (!typeMatches && !nameMatches) {
                    continue;
                }
            }

            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getProductVariant();
                Product product = variant.getProduct();
                Category category = product.getCategory();
                Brand brand = product.getBrand();

                // Apply Category filter
                if (filter.getCategoryId() != null && !filter.getCategoryId().isBlank()) {
                    if (category == null || !category.getId().equals(filter.getCategoryId().trim())) {
                        continue;
                    }
                }

                // Apply Brand filter
                if (filter.getBrandId() != null && !filter.getBrandId().isBlank()) {
                    if (brand == null || !brand.getId().equals(filter.getBrandId().trim())) {
                        continue;
                    }
                }

                matchedItems.add(new MatchedItem(order, item, product, category, brand));
                distinctOrderIds.add(order.getId());
            }
        }

        // Exception Flow 4a: No completed orders / matched items found
        if (matchedItems.isEmpty()) {
            return RevenueReportResponseDto.builder()
                    .totalRevenue(BigDecimal.ZERO)
                    .totalOrders(0)
                    .totalQuantitySold(0)
                    .message("No revenue data found for the selected period")
                    .trend(Collections.emptyList())
                    .revenueByCategory(Collections.emptyList())
                    .revenueByBrand(Collections.emptyList())
                    .topSellingProducts(Collections.emptyList())
                    .topProfitProducts(Collections.emptyList())
                    .revenueByPaymentMethod(Collections.emptyList())
                    .cancellationRate(cancellationRate)
                    .build();
        }

        // 1. Total Revenue
        BigDecimal totalRevenue = matchedItems.stream()
                .map(mi -> mi.item.calculateTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Total Orders
        int totalOrders = distinctOrderIds.size();

        // 3. Revenue By Category
        Map<Category, BigDecimal> categoryRevenueMap = new HashMap<>();
        for (MatchedItem mi : matchedItems) {
            Category cat = mi.category;
            BigDecimal rev = mi.item.calculateTotal();
            categoryRevenueMap.put(cat, categoryRevenueMap.getOrDefault(cat, BigDecimal.ZERO).add(rev));
        }
        List<CategoryRevenueDto> revenueByCategory = categoryRevenueMap.entrySet().stream()
                .map(e -> CategoryRevenueDto.builder()
                        .categoryId(e.getKey().getId())
                        .categoryName(e.getKey().getName())
                        .revenue(e.getValue())
                        .build())
                .sorted(Comparator.comparing(CategoryRevenueDto::getRevenue).reversed())
                .collect(Collectors.toList());

        // 4. Revenue By Brand
        Map<Brand, BigDecimal> brandRevenueMap = new HashMap<>();
        for (MatchedItem mi : matchedItems) {
            Brand br = mi.brand;
            BigDecimal rev = mi.item.calculateTotal();
            brandRevenueMap.put(br, brandRevenueMap.getOrDefault(br, BigDecimal.ZERO).add(rev));
        }
        List<BrandRevenueDto> revenueByBrand = brandRevenueMap.entrySet().stream()
                .map(e -> BrandRevenueDto.builder()
                        .brandId(e.getKey().getId())
                        .brandName(e.getKey().getName())
                        .revenue(e.getValue())
                        .build())
                .sorted(Comparator.comparing(BrandRevenueDto::getRevenue).reversed())
                .collect(Collectors.toList());

        // 5. Top 5 Selling Products (+ profit, when import cost data is available)
        Map<Product, ProductSalesAggregate> productSalesMap = new HashMap<>();
        for (MatchedItem mi : matchedItems) {
            Product prod = mi.product;
            int qty = mi.item.getQuantity();
            BigDecimal rev = mi.item.calculateTotal();

            ProductSalesAggregate agg = productSalesMap.computeIfAbsent(prod, k -> new ProductSalesAggregate());
            agg.quantitySold += qty;
            agg.revenue = agg.revenue.add(rev);

            BigDecimal avgCost = avgCostByVariantId.get(mi.item.getProductVariant().getId());
            if (avgCost != null) {
                agg.profit = agg.profit.add(rev.subtract(avgCost.multiply(BigDecimal.valueOf(qty))));
                agg.hasCostData = true;
            }
        }
        List<ProductSalesDto> topSellingProducts = productSalesMap.entrySet().stream()
                .map(e -> ProductSalesDto.builder()
                        .productId(e.getKey().getId())
                        .productName(e.getKey().getName())
                        .quantitySold(e.getValue().quantitySold)
                        .revenue(e.getValue().revenue)
                        .profit(e.getValue().hasCostData ? e.getValue().profit : null)
                        .build())
                .sorted((a, b) -> {
                    int cmp = Integer.compare(b.getQuantitySold(), a.getQuantitySold());
                    if (cmp != 0) return cmp;
                    return b.getRevenue().compareTo(a.getRevenue());
                })
                .limit(5)
                .collect(Collectors.toList());

        // 5b. Top 5 Most Profitable Products (only products with known import cost)
        List<ProductSalesDto> topProfitProducts = productSalesMap.entrySet().stream()
                .filter(e -> e.getValue().hasCostData)
                .map(e -> ProductSalesDto.builder()
                        .productId(e.getKey().getId())
                        .productName(e.getKey().getName())
                        .quantitySold(e.getValue().quantitySold)
                        .revenue(e.getValue().revenue)
                        .profit(e.getValue().profit)
                        .build())
                .sorted(Comparator.comparing(ProductSalesDto::getProfit).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // 6. Revenue By Payment Method
        Map<String, PaymentMethodRevenueAggregate> pmRevenueMap = new HashMap<>();
        for (MatchedItem mi : matchedItems) {
            PaymentMethod pm = mi.order.getSelectedPaymentMethod();
            String pmType = getPaymentMethodType(pm);
            String pmName = pm.getName();
            BigDecimal rev = mi.item.calculateTotal();

            PaymentMethodRevenueAggregate agg = pmRevenueMap.computeIfAbsent(pmName, k -> new PaymentMethodRevenueAggregate(pmType));
            agg.revenue = agg.revenue.add(rev);
        }
        List<PaymentMethodRevenueDto> revenueByPaymentMethod = pmRevenueMap.entrySet().stream()
                .map(e -> PaymentMethodRevenueDto.builder()
                        .paymentMethodName(e.getKey())
                        .paymentMethodType(e.getValue().type)
                        .revenue(e.getValue().revenue)
                        .build())
                .sorted(Comparator.comparing(PaymentMethodRevenueDto::getRevenue).reversed())
                .collect(Collectors.toList());

        // 7. Trend Chart
        List<RevenueTrendPointDto> trend = generateTrend(matchedItems, calculatedStart.toLocalDate(), calculatedEnd.toLocalDate());

        // Total units sold across ALL products, not just the top 5 in topSellingProducts —
        // that list is capped at 5 so its .length can't be used as a "products sold" count.
        int totalQuantitySold = productSalesMap.values().stream()
                .mapToInt(agg -> agg.quantitySold)
                .sum();

        return RevenueReportResponseDto.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalQuantitySold(totalQuantitySold)
                .trend(trend)
                .revenueByCategory(revenueByCategory)
                .revenueByBrand(revenueByBrand)
                .topSellingProducts(topSellingProducts)
                .topProfitProducts(topProfitProducts)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .cancellationRate(cancellationRate)
                .build();
    }

    public String exportRevenueReportToCsv(RevenueReportFilterRequestDto filter) {
        RevenueReportResponseDto report = getRevenueReport(filter);
        StringBuilder sb = new StringBuilder();

        // 1. General Info
        sb.append("REVENUE REPORT SUMMARY\n");
        sb.append("Time Period,").append(filter.getPeriod() != null ? filter.getPeriod() : "MONTHLY").append("\n");
        sb.append("Total Revenue,").append(report.getTotalRevenue()).append("\n");
        sb.append("Total Completed Orders,").append(report.getTotalOrders()).append("\n");
        sb.append("Cancellation Rate (%),").append(report.getCancellationRate()).append("\n");
        if (report.getMessage() != null) {
            sb.append("Message,").append(escapeCsv(report.getMessage())).append("\n");
        }
        sb.append("\n");

        // 2. Trend
        sb.append("REVENUE TREND\n");
        sb.append("Time Label,Revenue\n");
        for (RevenueTrendPointDto tp : report.getTrend()) {
            sb.append(escapeCsv(tp.getLabel())).append(",").append(tp.getRevenue()).append("\n");
        }
        sb.append("\n");

        // 3. Category
        sb.append("REVENUE BY PRODUCT CATEGORY\n");
        sb.append("Category ID,Category Name,Revenue\n");
        for (CategoryRevenueDto cr : report.getRevenueByCategory()) {
            sb.append(escapeCsv(cr.getCategoryId())).append(",")
              .append(escapeCsv(cr.getCategoryName())).append(",")
              .append(cr.getRevenue()).append("\n");
        }
        sb.append("\n");

        // 4. Brand
        sb.append("REVENUE BY BRAND\n");
        sb.append("Brand ID,Brand Name,Revenue\n");
        for (BrandRevenueDto br : report.getRevenueByBrand()) {
            sb.append(escapeCsv(br.getBrandId())).append(",")
              .append(escapeCsv(br.getBrandName())).append(",")
              .append(br.getRevenue()).append("\n");
        }
        sb.append("\n");

        // 5. Top Products
        sb.append("TOP 5 BEST-SELLING PRODUCTS\n");
        sb.append("Product ID,Product Name,Quantity Sold,Revenue\n");
        for (ProductSalesDto ps : report.getTopSellingProducts()) {
            sb.append(escapeCsv(ps.getProductId())).append(",")
              .append(escapeCsv(ps.getProductName())).append(",")
              .append(ps.getQuantitySold()).append(",")
              .append(ps.getRevenue()).append("\n");
        }
        sb.append("\n");

        // 5b. Top Profit Products
        sb.append("TOP 5 MOST PROFITABLE PRODUCTS\n");
        sb.append("Product ID,Product Name,Quantity Sold,Revenue,Profit\n");
        for (ProductSalesDto ps : report.getTopProfitProducts()) {
            sb.append(escapeCsv(ps.getProductId())).append(",")
              .append(escapeCsv(ps.getProductName())).append(",")
              .append(ps.getQuantitySold()).append(",")
              .append(ps.getRevenue()).append(",")
              .append(ps.getProfit()).append("\n");
        }
        sb.append("\n");

        // 6. Payment Method
        sb.append("REVENUE BY PAYMENT METHOD\n");
        sb.append("Payment Method,Type,Revenue\n");
        for (PaymentMethodRevenueDto pmr : report.getRevenueByPaymentMethod()) {
            sb.append(escapeCsv(pmr.getPaymentMethodName())).append(",")
              .append(escapeCsv(pmr.getPaymentMethodType())).append(",")
              .append(pmr.getRevenue()).append("\n");
        }

        return sb.toString();
    }

    private List<RevenueTrendPointDto> generateTrend(List<MatchedItem> matchedItems, LocalDate start, LocalDate end) {
        List<RevenueTrendPointDto> trend = new ArrayList<>();

        if (start.equals(end)) {
            // Same day: Hourly trend
            Map<Integer, BigDecimal> hourlyRev = new HashMap<>();
            Map<Integer, Set<String>> hourlyOrders = new HashMap<>();
            for (int h = 0; h < 24; h++) {
                hourlyRev.put(h, BigDecimal.ZERO);
                hourlyOrders.put(h, new HashSet<>());
            }
            for (MatchedItem mi : matchedItems) {
                int hour = mi.order.getOrderDate().getHour();
                BigDecimal rev = mi.item.calculateTotal();
                hourlyRev.put(hour, hourlyRev.get(hour).add(rev));
                hourlyOrders.get(hour).add(mi.order.getId());
            }
            for (int h = 0; h < 24; h++) {
                trend.add(new RevenueTrendPointDto(String.format("%02d:00", h), hourlyRev.get(h), hourlyOrders.get(h).size()));
            }
        } else {
            long days = ChronoUnit.DAYS.between(start, end);
            if (days <= 31) {
                // Daily trend
                Map<LocalDate, BigDecimal> dailyRev = new HashMap<>();
                Map<LocalDate, Set<String>> dailyOrders = new HashMap<>();
                LocalDate curr = start;
                while (!curr.isAfter(end)) {
                    dailyRev.put(curr, BigDecimal.ZERO);
                    dailyOrders.put(curr, new HashSet<>());
                    curr = curr.plusDays(1);
                }
                for (MatchedItem mi : matchedItems) {
                    LocalDate date = mi.order.getOrderDate().toLocalDate();
                    BigDecimal rev = mi.item.calculateTotal();
                    if (dailyRev.containsKey(date)) {
                        dailyRev.put(date, dailyRev.get(date).add(rev));
                        dailyOrders.get(date).add(mi.order.getId());
                    }
                }
                curr = start;
                while (!curr.isAfter(end)) {
                    trend.add(new RevenueTrendPointDto(curr.toString(), dailyRev.get(curr), dailyOrders.get(curr).size()));
                    curr = curr.plusDays(1);
                }
            } else {
                // Monthly trend
                Map<String, BigDecimal> monthlyRev = new LinkedHashMap<>();
                Map<String, Set<String>> monthlyOrders = new HashMap<>();
                LocalDate curr = start.withDayOfMonth(1);
                while (!curr.isAfter(end)) {
                    String monthLabel = String.format("%04d-%02d", curr.getYear(), curr.getMonthValue());
                    monthlyRev.put(monthLabel, BigDecimal.ZERO);
                    monthlyOrders.put(monthLabel, new HashSet<>());
                    curr = curr.plusMonths(1);
                }
                for (MatchedItem mi : matchedItems) {
                    LocalDateTime od = mi.order.getOrderDate();
                    String monthLabel = String.format("%04d-%02d", od.getYear(), od.getMonthValue());
                    BigDecimal rev = mi.item.calculateTotal();
                    if (monthlyRev.containsKey(monthLabel)) {
                        monthlyRev.put(monthLabel, monthlyRev.get(monthLabel).add(rev));
                        monthlyOrders.get(monthLabel).add(mi.order.getId());
                    }
                }
                for (Map.Entry<String, BigDecimal> entry : monthlyRev.entrySet()) {
                    String label = entry.getKey();
                    trend.add(new RevenueTrendPointDto(label, entry.getValue(), monthlyOrders.get(label).size()));
                }
            }
        }

        return trend;
    }

    private String getPaymentMethodType(PaymentMethod pm) {
        if (pm instanceof MomoPaymentMethod) {
            return "MOMO";
        } else if (pm instanceof VNPayPaymentMethod) {
            return "VNPAY";
        } else if (pm instanceof CODPaymentMethod) {
            return "COD";
        }
        return "UNKNOWN";
    }

    private String escapeCsv(String val) {
        if (val == null) {
            return "";
        }
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    // Helper classes for aggregation
    private static class MatchedItem {
        final Order order;
        final OrderItem item;
        final Product product;
        final Category category;
        final Brand brand;

        MatchedItem(Order order, OrderItem item, Product product, Category category, Brand brand) {
            this.order = order;
            this.item = item;
            this.product = product;
            this.category = category;
            this.brand = brand;
        }
    }

    private static class ProductSalesAggregate {
        int quantitySold = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal profit = BigDecimal.ZERO;
        boolean hasCostData = false;
    }

    private static class PaymentMethodRevenueAggregate {
        final String type;
        BigDecimal revenue = BigDecimal.ZERO;

        PaymentMethodRevenueAggregate(String type) {
            this.type = type;
        }
    }
}
