package com.ims.config;

import com.ims.model.User;
import com.ims.repository.ItemRepository;
import com.ims.repository.NotificationRepository;
import com.ims.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository         userRepository;
    private final ItemRepository         itemRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder        passwordEncoder;

    @Override
    public void run(String... args) {
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
        log.info("Seeded users: admin (admin123), user (user123)");
    }
}