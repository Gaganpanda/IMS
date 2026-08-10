package com.ims.config;

import com.ims.model.User;
import com.ims.repository.ItemRepository;
import com.ims.repository.NotificationRepository;
import com.ims.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds demo users (admin/admin123, user/user123) on first run so local dev
 * and evaluation environments work out of the box.
 *
 * IMPORTANT — production safety: set {@code app.seed-demo-users=false}
 * (env var {@code SEED_DEMO_USERS=false}) before deploying anywhere real.
 * Leaving well-known default credentials active outside local dev is a
 * genuine security risk, not just a "known follow-up".
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository         userRepository;
    private final ItemRepository         itemRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder        passwordEncoder;

    @Value("${app.seed-demo-users:true}")
    private boolean seedDemoUsers;

    @Override
    public void run(String... args) {
        if (!seedDemoUsers) {
            log.info("SEED_DEMO_USERS is false — skipping demo user seeding.");
            return;
        }
        seedUsers();
    }

    @Transactional
    protected void seedUsers() {
        if (userRepository.existsByUsername("admin")) {
            log.info("Users already seeded, skipping.");
            return;
        }

        User admin = User.builder()
                .name("Admin User")
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .email("admin@ims.gov.in")
                .role(User.Role.ADMIN)
                .active(true)
                .build();

        User staff = User.builder()
                .name("Staff User")
                .username("user")
                .password(passwordEncoder.encode("user123"))
                .email("user@ims.gov.in")
                .role(User.Role.USER)
                .active(true)
                .build();

        userRepository.saveAll(java.util.List.of(admin, staff));
        log.warn("Seeded DEMO users with default credentials (admin/admin123, user/user123). " +
                 "Disable via app.seed-demo-users=false (or SEED_DEMO_USERS=false) and rotate/remove " +
                 "these accounts before any real deployment.");
    }
}