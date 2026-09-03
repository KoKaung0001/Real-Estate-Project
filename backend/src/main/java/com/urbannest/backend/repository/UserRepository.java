package com.urbannest.backend.repository;

import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
