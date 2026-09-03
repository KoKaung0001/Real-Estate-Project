package com.urbannest.backend.dto;

import com.urbannest.backend.entity.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        String link,
        boolean isRead,
        Instant createdAt
) {
}
