package com.urbannest.backend.service;

import com.urbannest.backend.dto.NotificationResponse;
import com.urbannest.backend.entity.Notification;
import com.urbannest.backend.entity.NotificationType;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.NotificationRepository;
import com.urbannest.backend.repository.UserRepository;
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
    private final UserRepository userRepository;

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

    @Transactional
    public void createContactMessageNotifications(String fullName) {
        createAdminNotifications(
                NotificationType.CONTACT_MESSAGE_RECEIVED,
                "New Contact Message",
                fullName + " sent a new contact message.",
                "/admin/dashboard"
        );
    }

    @Transactional
    public void createPropertyApprovalRequestNotifications(Property property) {
        createAdminNotifications(
                NotificationType.PROPERTY_APPROVAL_REQUESTED,
                "New Property Approval Request",
                property.getOwner().getUsername() + " submitted \"" + property.getTitle() + "\" for approval.",
                "/admin/dashboard"
        );
    }

    @Transactional
    public void createPropertySubmittedNotification(Property property) {
        repository.save(Notification.builder()
                .user(property.getOwner())
                .type(NotificationType.PROPERTY_SUBMITTED)
                .title("Property Submitted")
                .message("Your listing \"" + property.getTitle() + "\" has been submitted for approval.")
                .link("/user/my-properties")
                .build());
    }

    private void createAdminNotifications(NotificationType type, String title, String message, String link) {
        List<Notification> notifications = userRepository.findByRole(UserRole.ADMIN).stream()
                .map(admin -> adminNotification(admin, type, title, message, link))
                .toList();
        repository.saveAll(notifications);
    }

    private Notification adminNotification(
            User admin,
            NotificationType type,
            String title,
            String message,
            String link) {
        return Notification.builder()
                .user(admin)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .build();
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
