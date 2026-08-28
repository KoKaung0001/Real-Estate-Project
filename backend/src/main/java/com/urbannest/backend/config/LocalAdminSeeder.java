package com.urbannest.backend.config;

import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local & admin-seed")
@RequiredArgsConstructor
@Slf4j
public class LocalAdminSeeder implements CommandLineRunner {

    private static final String LOCAL_ADMIN_PHONE = "0000000000";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${APP_ADMIN_USERNAME:}")
    private String configuredUsername;

    @Value("${APP_ADMIN_EMAIL:}")
    private String configuredEmail;

    @Value("${APP_ADMIN_PASSWORD:}")
    private String configuredPassword;

    @Override
    @Transactional
    public void run(String... args) {
        String username = configuredUsername.trim();
        String email = configuredEmail.trim();

        if (username.isBlank() || email.isBlank() || configuredPassword.isBlank()) {
            throw new IllegalStateException(
                    "The admin-seed profile requires APP_ADMIN_USERNAME, APP_ADMIN_EMAIL, and APP_ADMIN_PASSWORD");
        }

        User existingAdmin = userRepository.findByUsername(username).orElse(null);
        if (existingAdmin == null) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalStateException(
                        "APP_ADMIN_EMAIL already belongs to a different user; admin provisioning was stopped");
            }

            userRepository.save(User.builder()
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(configuredPassword))
                    .phone(LOCAL_ADMIN_PHONE)
                    .role(UserRole.ADMIN)
                    .build());
            log.info("Created local administrator account for username '{}'", username);
            return;
        }

        if (!existingAdmin.getEmail().equalsIgnoreCase(email)) {
            throw new IllegalStateException(
                    "APP_ADMIN_USERNAME already belongs to a user with a different email; admin provisioning was stopped");
        }

        boolean changed = false;
        if (existingAdmin.getRole() != UserRole.ADMIN) {
            existingAdmin.setRole(UserRole.ADMIN);
            changed = true;
        }
        if (!passwordEncoder.matches(configuredPassword, existingAdmin.getPassword())) {
            existingAdmin.setPassword(passwordEncoder.encode(configuredPassword));
            changed = true;
        }

        if (changed) {
            userRepository.save(existingAdmin);
            log.info("Updated local administrator account for username '{}'", username);
        }
    }
}
