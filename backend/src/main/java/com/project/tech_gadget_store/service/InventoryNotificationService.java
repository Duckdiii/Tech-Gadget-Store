package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.entity.*;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import com.project.tech_gadget_store.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.entity.enums.NotificationType;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.FavoriteProductRepository;
import com.project.tech_gadget_store.repository.NotificationRepository;
import com.project.tech_gadget_store.repository.ProductVariantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class InventoryNotificationService {

    private final ProductVariantRepository productVariantRepository;
    private final FavoriteProductRepository favoriteProductRepository;
    private final NotificationRepository notificationRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;
    private final long lowStockThreshold;

    public InventoryNotificationService(
            ProductVariantRepository productVariantRepository,
            FavoriteProductRepository favoriteProductRepository,
            NotificationRepository notificationRepository,
            AccountRepository accountRepository,
            EmailService emailService,
            @Value("${app.inventory.low-stock-threshold:5}") long lowStockThreshold) {
        this.productVariantRepository = productVariantRepository;
        this.favoriteProductRepository = favoriteProductRepository;
        this.notificationRepository = notificationRepository;
        this.accountRepository = accountRepository;
        this.emailService = emailService;
        this.lowStockThreshold = lowStockThreshold;
    }

    @Transactional
    public void checkAndNotify(Product product) {
        long remainingQty = productVariantRepository.countAvailablePhysicalUnitsByProductId(product.getId());

        if (remainingQty == 0) {
            // Out of stock notification to subscribed customers
            List<FavoriteProduct> subscriptions = favoriteProductRepository
                    .findByProductVariantProductIdAndStatus(product.getId(), SubscriptionStatus.SUBSCRIBED);

            for (FavoriteProduct sub : subscriptions) {
                Notification notification = new Notification(
                        sub.getCustomer(),
                        "Stock Out",
                        NotificationType.STOCK_CHANGE,
                        "Sản phẩm " + product.getName() + " đã hết hàng (Out of Stock).",
                        List.of(NotificationChannel.WEB));
                notification.markSent();
                notificationRepository.save(notification);
            }
        } else if (remainingQty <= lowStockThreshold) {
            // Low stock email alert to staff & managers
            try {
                List<Account> recipients = accountRepository.findManagerAndStaffAccountsByStatus(AccountStatus.ACTIVE);
                String subject = "[TechStore] Cảnh báo sắp hết hàng: " + product.getName();
                String body = "Sản phẩm \"" + product.getName() + "\" chỉ còn " + remainingQty
                        + " đơn vị trong kho. Vui lòng cân nhắc nhập thêm hàng.";
                for (Account account : recipients) {
                    emailService.send(account.getEmail(), subject, body);
                }
            } catch (Exception e) {
                log.error("Failed to send low-stock alert email for product: {}", product.getId(), e);
            }
        }
    }

    @Transactional
    public void checkAndNotifyRestock(Product product) {
        long remainingQty = productVariantRepository.countAvailablePhysicalUnitsByProductId(product.getId());

        if (remainingQty > 0) {
            // Notify subscribed customers about restock
            List<FavoriteProduct> subscriptions = favoriteProductRepository
                    .findByProductVariantProductIdAndStatus(product.getId(), SubscriptionStatus.SUBSCRIBED);

            for (FavoriteProduct sub : subscriptions) {
                Notification notification = new Notification(
                        sub.getCustomer(),
                        "Restock",
                        NotificationType.RESTOCKED,
                        "Sản phẩm " + product.getName() + " đã có hàng trở lại!",
                        List.of(NotificationChannel.WEB));
                notification.markSent();
                notificationRepository.save(notification);
            }
        }
    }
}
