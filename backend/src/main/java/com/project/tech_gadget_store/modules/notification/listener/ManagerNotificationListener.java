package com.project.tech_gadget_store.modules.notification.listener;

import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.notification.entity.Notification;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationChannel;
import com.project.tech_gadget_store.modules.notification.entity.enums.NotificationType;
import com.project.tech_gadget_store.modules.notification.event.ExportStockEvent;
import com.project.tech_gadget_store.modules.notification.event.ImportStockEvent;
import com.project.tech_gadget_store.modules.notification.event.ProductStockChangedEvent;
import com.project.tech_gadget_store.modules.notification.repository.NotificationRepository;
import com.project.tech_gadget_store.modules.notification.service.EmailService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;



@Slf4j
@Component
public class ManagerNotificationListener {

    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final long lowStockThreshold;

    public ManagerNotificationListener(
            AccountRepository accountRepository,
            NotificationRepository notificationRepository,
            EmailService emailService,
            @Value("${app.inventory.low-stock-threshold:5}") long lowStockThreshold) {
        this.accountRepository = accountRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.lowStockThreshold = lowStockThreshold;
    }

    @Async
    @EventListener
    public void handleProductStockChanged(ProductStockChangedEvent event) {
        Product product = event.getProduct();
        long newStock = event.getNewStock();

        if (newStock > 0 && newStock <= lowStockThreshold) {
            String title = "Cảnh báo tồn kho thấp";
            String message = "Sản phẩm \"" + product.getName() + "\" chỉ còn " + newStock + " đơn vị trong kho. Vui lòng nhập thêm hàng.";
            NotificationType type = NotificationType.LOW_STOCK;

            sendNotificationsToManagersAndStaff(title, message, type);
        }
    }

    @Async
    @EventListener
    public void handleImportStock(ImportStockEvent event) {
        String title = event.isSuccess() ? "Nhập hàng thành công" : "Nhập hàng thất bại";
        String message = event.isSuccess() 
                ? "Yêu cầu nhập hàng được thực hiện bởi " + event.getPerformedBy() + " đã thành công. Ghi chú: " + event.getNote()
                : "Yêu cầu nhập hàng được thực hiện bởi " + event.getPerformedBy() + " đã thất bại. Ghi chú: " + event.getNote();
        NotificationType type = NotificationType.IMPORT_STOCK;

        sendNotificationsToManagersAndStaff(title, message, type);
    }

    @Async
    @EventListener
    public void handleExportStock(ExportStockEvent event) {
        String title = event.isSuccess() ? "Xuất kho thành công" : "Xuất kho thất bại";
        String message = event.isSuccess() 
                ? "Yêu cầu xuất kho được thực hiện bởi " + event.getPerformedBy() + " đã thành công. Lý do: " + event.getReason()
                : "Yêu cầu xuất kho được thực hiện bởi " + event.getPerformedBy() + " đã thất bại. Lý do: " + event.getReason();
        NotificationType type = NotificationType.EXPORT_STOCK;

        sendNotificationsToManagersAndStaff(title, message, type);
    }

    private void sendNotificationsToManagersAndStaff(String title, String message, NotificationType type) {
        try {
            List<Account> recipients = accountRepository.findManagerAndStaffAccountsByStatus(AccountStatus.ACTIVE);
            for (Account account : recipients) {
                if (account.getUser() != null) {
                    try {
                        Notification notification = new Notification(
                                account.getUser(),
                                title,
                                type,
                                message,
                                List.of(NotificationChannel.WEB, NotificationChannel.EMAIL));
                        notification.markSent();
                        notificationRepository.save(notification);

                        // Send email
                        emailService.send(account.getEmail(), "[TechStore] " + title, message);
                    } catch (Exception ex) {
                        log.error("Failed to create/send notification to account: {}", account.getId(), ex);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch manager and staff accounts for notification: {}", e.getMessage(), e);
        }
    }
}
