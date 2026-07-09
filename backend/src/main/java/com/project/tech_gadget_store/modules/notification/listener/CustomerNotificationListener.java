package com.project.tech_gadget_store.modules.notification.listener;

import com.project.tech_gadget_store.modules.catalog.entity.FavoriteProduct;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.repository.FavoriteProductRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.modules.notification.entity.Notification;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationType;
import com.project.tech_gadget_store.modules.notification.event.ProductPromotionAppliedEvent;
import com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent;
import com.project.tech_gadget_store.modules.notification.repository.NotificationRepository;
import com.project.tech_gadget_store.modules.notification.service.EmailService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;



@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerNotificationListener {

    private final FavoriteProductRepository favoriteProductRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @EventListener
    public void handleProductStockChanged(ProductStockChangedEvent event) {
        Product product = event.getProduct();
        long oldStock = event.getOldStock();
        long newStock = event.getNewStock();

        String title = null;
        String message = null;
        NotificationType type = null;

        if (newStock == 0 && oldStock > 0) {
            title = "Hết hàng";
            message = "Sản phẩm " + product.getName() + " đã hết hàng (Out of Stock).";
            type = NotificationType.OUT_OF_STOCK;
        } else if (oldStock == 0 && newStock > 0) {
            title = "Có hàng trở lại";
            message = "Sản phẩm " + product.getName() + " đã có hàng trở lại!";
            type = NotificationType.RESTOCKED;
        }

        if (title != null) {
            List<FavoriteProduct> subscriptions = favoriteProductRepository
                    .findByProductVariantProductIdAndStatus(product.getId(), SubscriptionStatus.SUBSCRIBED);

            for (FavoriteProduct sub : subscriptions) {
                try {
                    Notification notification = new Notification(
                            sub.getCustomer(),
                            title,
                            type,
                            message,
                            List.of(NotificationChannel.WEB, NotificationChannel.EMAIL));
                    notification.markSent();
                    notificationRepository.save(notification);

                    // Send email to customer
                    if (sub.getCustomer().getAccount() != null) {
                        emailService.send(sub.getCustomer().getAccount().getEmail(), "[TechStore] " + title, message);
                    }
                } catch (Exception e) {
                    log.error("Failed to create/send stock notification for customer: {}", sub.getCustomer().getId(), e);
                }
            }
        }
    }

    @EventListener
    public void handleProductPromotionApplied(ProductPromotionAppliedEvent event) {
        Promotion promotion = event.getPromotion();
        List<Product> products = event.getProducts();

        for (Product product : products) {
            List<FavoriteProduct> subscriptions = favoriteProductRepository
                    .findByProductVariantProductIdAndStatus(product.getId(), SubscriptionStatus.SUBSCRIBED);

            String title = "Khuyến mãi mới";
            String message = "Sản phẩm yêu thích \"" + product.getName() + "\" của bạn đang có chương trình khuyến mãi \"" + promotion.getName() + "\" giảm " + promotion.getDiscountPercent() + "%!";
            NotificationType type = NotificationType.PROMOTION;

            for (FavoriteProduct sub : subscriptions) {
                try {
                    Notification notification = new Notification(
                            sub.getCustomer(),
                            title,
                            type,
                            message,
                            List.of(NotificationChannel.WEB, NotificationChannel.EMAIL));
                    notification.markSent();
                    notificationRepository.save(notification);

                    // Send email to customer
                    if (sub.getCustomer().getAccount() != null) {
                        emailService.send(sub.getCustomer().getAccount().getEmail(), "[TechStore] " + title, message);
                    }
                } catch (Exception e) {
                    log.error("Failed to create/send promotion notification for customer: {}", sub.getCustomer().getId(), e);
                }
            }
        }
    }
}
