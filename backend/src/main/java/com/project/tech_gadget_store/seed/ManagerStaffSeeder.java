package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Manager;
import com.project.tech_gadget_store.modules.auth.entity.Staff;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.ManagerRepository;
import com.project.tech_gadget_store.modules.auth.repository.StaffRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds one Manager and one Staff test account, since the app has no public API for creating
 * a Manager (only {@code POST /api/manager/staff}, which itself requires an existing manager's
 * JWT). Runs under its own "seed-accounts" profile — deliberately separate from "seed" — so
 * activating it never also triggers {@link CatalogSeeder} / {@link CustomerOrderSeeder} /
 * {@link ProductSerialSeeder}'s bulk fake-data generation. Skips entirely if a manager already
 * exists.
 */
@Component
@Profile("seed-accounts")
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class ManagerStaffSeeder implements CommandLineRunner {

    private static final String MANAGER_EMAIL = "manager@test.com";
    private static final String MANAGER_PASSWORD = "Manager@123";
    private static final String STAFF_EMAIL = "staff@test.com";
    private static final String STAFF_PASSWORD = "Staff@123";
    private static final String STAFF_CODE = "STF-TEST-001";

    private final ManagerRepository managerRepository;
    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (managerRepository.count() > 0) {
            log.info("[ManagerStaffSeeder] Manager already exists, skipping manager/staff seed.");
            return;
        }

        Manager manager = new Manager("Test Manager", "0900000001");
        managerRepository.save(manager);
        accountRepository.save(new Account(
                MANAGER_EMAIL, passwordEncoder.encode(MANAGER_PASSWORD), manager, AccountStatus.ACTIVE));

        Staff staff = new Staff("Test Staff", "0900000002", STAFF_CODE, LocalDate.now());
        staffRepository.save(staff);
        accountRepository.save(new Account(
                STAFF_EMAIL, passwordEncoder.encode(STAFF_PASSWORD), staff, AccountStatus.ACTIVE));

        log.info("[ManagerStaffSeeder] Seeded manager ({}) and staff ({}) test accounts.",
                MANAGER_EMAIL, STAFF_EMAIL);
    }
}
