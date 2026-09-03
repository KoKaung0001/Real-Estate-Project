package com.urbannest.backend.controller;

import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Notification;
import com.urbannest.backend.entity.NotificationType;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.NotificationRepository;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.CustomUserDetails;
import com.urbannest.backend.service.AdminService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void pendingToApprovedCreatesOwnerNotification() {
        User owner = createUser("approved-owner");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Approval Test Home");

        adminService.approveProperty(property.getId());

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId());
        assertEquals(1, notifications.size());
        Notification notification = notifications.getFirst();
        assertEquals(NotificationType.PROPERTY_APPROVED, notification.getType());
        assertEquals("Property Approved", notification.getTitle());
        assertEquals("Your listing \"Approval Test Home\" has been approved.", notification.getMessage());
        assertEquals("/property/" + property.getId(), notification.getLink());
        assertFalse(notification.isRead());
    }

    @Test
    void pendingToRejectedCreatesOwnerNotification() {
        User owner = createUser("rejected-owner");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Rejection Test Home");

        adminService.rejectProperty(property.getId());

        Notification notification = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).getFirst();
        assertEquals(NotificationType.PROPERTY_REJECTED, notification.getType());
        assertEquals("Property Rejected", notification.getTitle());
        assertEquals("Your listing \"Rejection Test Home\" was not approved.", notification.getMessage());
        assertEquals("/user/my-properties", notification.getLink());
    }

    @Test
    void repeatedApprovedStatusDoesNotCreateDuplicate() {
        User owner = createUser("repeat-approved");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Repeat Approval");

        adminService.approveProperty(property.getId());
        adminService.approveProperty(property.getId());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());
    }

    @Test
    void repeatedRejectedStatusDoesNotCreateDuplicate() {
        User owner = createUser("repeat-rejected");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Repeat Rejection");

        adminService.rejectProperty(property.getId());
        adminService.rejectProperty(property.getId());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());
    }

    @Test
    void notificationBelongsOnlyToPropertyOwner() {
        User owner = createUser("actual-owner");
        User unrelated = createUser("unrelated-user");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Private Owner Update");

        adminService.approveProperty(property.getId());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(unrelated.getId()).isEmpty());
    }

    @Test
    void notificationListRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userReceivesOnlyOwnNotificationsNewestFirst() throws Exception {
        User owner = createUser("list-owner");
        User other = createUser("list-other");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Ordered Update");
        Property otherProperty = createProperty(other, ApprovalStatus.PENDING, "Other Update");

        adminService.approveProperty(property.getId());
        adminService.rejectProperty(property.getId());
        adminService.approveProperty(otherProperty.getId());

        mockMvc.perform(get("/api/notifications").with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].type").value("PROPERTY_REJECTED"))
                .andExpect(jsonPath("$[1].type").value("PROPERTY_APPROVED"))
                .andExpect(jsonPath("$[0].message").value("Your listing \"Ordered Update\" was not approved."));
    }

    @Test
    void userCanMarkOwnNotificationReadAndStatePersists() throws Exception {
        User owner = createUser("read-owner");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Read Update");
        adminService.approveProperty(property.getId());
        Long notificationId = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).getFirst().getId();

        mockMvc.perform(put("/api/notifications/{id}/read", notificationId)
                        .with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        entityManager.flush();
        entityManager.clear();
        assertTrue(notificationRepository.findById(notificationId).orElseThrow().isRead());
    }

    @Test
    void userCannotMarkAnotherUsersNotificationRead() throws Exception {
        User owner = createUser("protected-owner");
        User other = createUser("id-guesser");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Protected Update");
        adminService.approveProperty(property.getId());
        Long notificationId = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).getFirst().getId();

        mockMvc.perform(put("/api/notifications/{id}/read", notificationId)
                        .with(user(new CustomUserDetails(other))))
                .andExpect(status().isNotFound());

        assertFalse(notificationRepository.findById(notificationId).orElseThrow().isRead());
    }

    @Test
    void markAllReadAffectsOnlyAuthenticatedUser() throws Exception {
        User owner = createUser("mark-all-owner");
        User other = createUser("mark-all-other");
        Property first = createProperty(owner, ApprovalStatus.PENDING, "First Owner Update");
        Property second = createProperty(owner, ApprovalStatus.PENDING, "Second Owner Update");
        Property unrelated = createProperty(other, ApprovalStatus.PENDING, "Unrelated Update");
        adminService.approveProperty(first.getId());
        adminService.rejectProperty(second.getId());
        adminService.approveProperty(unrelated.getId());

        mockMvc.perform(put("/api/notifications/read-all")
                        .with(user(new CustomUserDetails(owner))))
                .andExpect(status().isNoContent());

        entityManager.flush();
        entityManager.clear();
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId())
                .stream().allMatch(Notification::isRead));
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(other.getId())
                .stream().noneMatch(Notification::isRead));
    }

    private User createUser(String prefix) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        return userRepository.save(User.builder()
                .username(prefix + "-" + suffix)
                .email(prefix + "-" + suffix + "@example.test")
                .password("not-used-in-test")
                .phone("09 000 000 000")
                .role(UserRole.USER)
                .build());
    }

    private Property createProperty(User owner, ApprovalStatus approvalStatus, String title) {
        return propertyRepository.save(Property.builder()
                .title(title)
                .description("Notification integration test property")
                .price(BigDecimal.valueOf(100_000))
                .location("Yangon")
                .propertyType(PropertyType.APARTMENT)
                .status(SaleStatus.FOR_SALE)
                .approvalStatus(approvalStatus)
                .bedrooms(2)
                .bathrooms(1)
                .area(750.0)
                .imageUrl("")
                .owner(owner)
                .build());
    }
}
