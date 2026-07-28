package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.MembershipBenefit;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.payment.entity.CODPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.PaymentMethod;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Chạy các native SQL query của ProductRepository trên Postgres thật (Testcontainers) — không
 * mock repository như phần lớn test khác trong repo. Mock không bao giờ phát hiện được lỗi cú
 * pháp/logic SQL (vd. searchProductIdsByKeyword từng tham chiếu cột search_vector không tồn tại
 * trong bất kỳ migration nào — bug này chỉ lộ ra khi chạy trên DB thật, xem V3__add_products_search_vector.sql).
 */
@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.flyway.enabled=true"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ProductRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private TestEntityManager em;

    @Autowired
    private ProductRepository productRepository;

    private Category category;
    private Brand brand;
    private Customer customer;
    private Address address;
    private PaymentMethod paymentMethod;

    @BeforeEach
    void setUp() {
        category = em.persistFlushFind(new Category("Điện thoại", "https://img.test/category.png"));
        brand = em.persistFlushFind(new Brand("TestBrand", "https://img.test/brand.png", "Thương hiệu test"));

        MembershipBenefit benefit = em.persistFlushFind(new MembershipBenefit(0.0, false, "Hạng mặc định"));
        Membership membership = em.persistFlushFind(
                new Membership(MembershipTier.STANDARD, benefit, BigDecimal.ZERO, BigDecimal.valueOf(10_000_000)));

        // Address không có FK riêng — nó thuộc sở hữu của User.addresses (cascade ALL, user_id
        // NOT NULL), nên phải gắn qua customer.changeAddress(...) rồi cascade-persist theo
        // customer, chứ không thể persist Address đứng một mình.
        address = new Address("123 Test", "Phường 1", "Quận 1", "TP.HCM");
        customer = new Customer("Khách test", "0900000000", membership);
        customer.changeAddress(address);
        customer = em.persistFlushFind(customer);

        paymentMethod = em.persistFlushFind(new CODPaymentMethod("COD", "Thanh toán khi nhận hàng", null, BigDecimal.ZERO));
    }

    private Product persistProduct(String name, String description) {
        Product product = new Product(name, description, brand, category);
        return em.persistFlushFind(product);
    }

    private ProductVariant persistVariant(Product product) {
        ProductVariant variant = new ProductVariant(product, 8, 128, "Đen", BigDecimal.valueOf(10_000_000));
        return em.persistFlushFind(variant);
    }

    private Order persistOrder(OrderStatus status, ProductVariant... variants) {
        Order order = new Order(customer, address, paymentMethod);
        for (ProductVariant variant : variants) {
            new OrderItem(order, variant, 1, variant.getPrice());
        }
        order.applyStatus(status);
        return em.persistFlushFind(order);
    }

    @Test
    void findFrequentlyBoughtTogetherIds_CountsOnlyNonCancelledCoOccurrences() {
        Product target = persistProduct("iPhone 15", "Điện thoại Apple");
        Product frequentlyBoughtWith = persistProduct("Ốp lưng iPhone", "Phụ kiện bảo vệ máy");
        Product neverBoughtWith = persistProduct("Samsung Galaxy S24", "Điện thoại Samsung");
        Product onlyInCancelledOrder = persistProduct("Sạc dự phòng", "Phụ kiện sạc");

        ProductVariant targetVariant = persistVariant(target);
        ProductVariant frequentVariant = persistVariant(frequentlyBoughtWith);
        persistVariant(neverBoughtWith);
        ProductVariant cancelledOnlyVariant = persistVariant(onlyInCancelledOrder);

        // 2 đơn hoàn tất mua cùng target + frequentlyBoughtWith → phải xuất hiện trong kết quả
        persistOrder(OrderStatus.COMPLETED, targetVariant, frequentVariant);
        persistOrder(OrderStatus.COMPLETED, targetVariant, frequentVariant);
        // 1 đơn đã huỷ mua cùng target + onlyInCancelledOrder → KHÔNG được tính
        persistOrder(OrderStatus.CANCELLED, targetVariant, cancelledOnlyVariant);

        List<String> result = productRepository.findFrequentlyBoughtTogetherIds(target.getId(), 10);

        assertThat(result)
                .contains(frequentlyBoughtWith.getId())
                .doesNotContain(target.getId())
                .doesNotContain(neverBoughtWith.getId())
                .doesNotContain(onlyInCancelledOrder.getId());
    }

    @Test
    void searchProductIdsByKeyword_MatchesByNameViaFullTextSearch() {
        Product iphone = persistProduct("iPhone 15 Pro Max", "Điện thoại cao cấp của Apple");
        Product samsung = persistProduct("Samsung Galaxy S24", "Điện thoại flagship của Samsung");

        List<String> result = productRepository.searchProductIdsByKeyword("iphone", 10);

        assertThat(result)
                .contains(iphone.getId())
                .doesNotContain(samsung.getId());
    }

    @Test
    void searchProductIdsByKeyword_NoMatch_ReturnsEmptyList() {
        persistProduct("iPhone 15 Pro Max", "Điện thoại cao cấp của Apple");

        List<String> result = productRepository.searchProductIdsByKeyword("nonexistentkeyword", 10);

        assertThat(result).isEmpty();
    }
}
