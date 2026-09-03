package com.urbannest.backend.service;

import com.urbannest.backend.dto.ContactMessageResponse;
import com.urbannest.backend.dto.CreateContactMessageRequest;
import com.urbannest.backend.entity.ContactMessage;
import com.urbannest.backend.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository repository;
    private final NotificationService notificationService;

    @Transactional
    public ContactMessageResponse create(CreateContactMessageRequest request) {
        ContactMessage contactMessage = ContactMessage.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim())
                .phone(trimToNull(request.phone()))
                .message(request.message().trim())
                .build();

        ContactMessage saved = repository.save(contactMessage);
        notificationService.createContactMessageNotifications(saved);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> getAllNewestFirst() {
        return repository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ContactMessageResponse toResponse(ContactMessage contactMessage) {
        return new ContactMessageResponse(
                contactMessage.getId(),
                contactMessage.getFullName(),
                contactMessage.getEmail(),
                contactMessage.getPhone(),
                contactMessage.getMessage(),
                contactMessage.getCreatedAt()
        );
    }
}
