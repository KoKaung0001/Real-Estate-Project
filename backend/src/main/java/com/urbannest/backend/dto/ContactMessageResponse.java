package com.urbannest.backend.dto;

import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String message,
        Instant createdAt
) {
}
