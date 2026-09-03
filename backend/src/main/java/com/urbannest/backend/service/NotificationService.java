package com.urbannest.backend.service;

import com.urbannest.backend.dto.NotificationResponse;
import com.urbannest.backend.entity.Notification;
import com.urbannest.backend.entity.NotificationType;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.repository.NotificationRepository;
import com.urbannest.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    @Transactional
    public void createPropertyStatusNotification(Property property, NotificationType type) {
        boolean approved = type == NotificationType.PROPERTY_APPROVED;
        Notification notification = Notification.builder()
                .user(property.getOwner())
                .type(type)
                .title(approved ? "Property Approved" : "Property Rejected")
                .message(approved
                        ? "Your listing \"" + property.getTitle() + "\" has been approved."
                        : "Your listing \"" + property.getTitle() + "\" was not approved.")
                .link(approved ? "/property/" + property.getId() : "/user/my-properties")
                .build();
        repository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getCurrentUserNotifications() {
        return repository.findByUserIdOrderByCreatedAtDescIdDesc(currentUserId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId) {
        Notification notification = repository.findByIdAndUserId(notificationId, currentUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(true);
        return toResponse(repository.save(notification));
    }

    @Transactional
    public void markAllRead() {
        List<Notification> unread = repository.findByUserIdAndReadFalse(currentUserId());
        unread.forEach(notification -> notification.setRead(true));
        repository.saveAll(unread);
    }

    private Long currentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof CustomUserDetails userDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getId();
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLink(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
