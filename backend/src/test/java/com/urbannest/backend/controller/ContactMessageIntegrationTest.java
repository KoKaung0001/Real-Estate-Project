package com.urbannest.backend.controller;

import com.urbannest.backend.entity.ContactMessage;
import com.urbannest.backend.repository.ContactMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ContactMessageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContactMessageRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void clearContactMessages() {
        repository.deleteAll();
        repository.flush();
    }

    @Test
    void anonymousContactSubmissionSucceeds() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Anonymous Visitor", "anonymous@example.com", "Hello")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void validMessageIsTrimmedAndPersisted() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "  Example User  ",
                                "email", "example@test.com",
                                "phone", "   ",
                                "message", "  I would like more information.  "
                        ))))
                .andExpect(status().isCreated());

        assertEquals(1, repository.count());
        ContactMessage saved = repository.findAll().getFirst();
        assertEquals("Example User", saved.getFullName());
        assertEquals("example@test.com", saved.getEmail());
        assertNull(saved.getPhone());
        assertEquals("I would like more information.", saved.getMessage());
    }

    @Test
    void missingNameIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(" ", "valid@example.com", "Hello")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidEmailIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Example", "not-an-email", "Hello")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void emptyMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Example", "valid@example.com", "   ")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void oversizedFieldsAreRejected() throws Exception {
        for (Map<String, String> body : List.of(
                requestMap("N".repeat(121), "valid@example.com", "09", "Hello"),
                requestMap("Example", "a".repeat(250) + "@example.com", "09", "Hello"),
                requestMap("Example", "valid@example.com", "0".repeat(41), "Hello"),
                requestMap("Example", "valid@example.com", "09", "M".repeat(5001))
        )) {
            mockMvc.perform(post("/api/contact-messages")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void adminCanListMessagesNewestFirst() throws Exception {
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("First", "first@example.com", "First message")))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest("Second", "second@example.com", "Second message")))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/contact-messages")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].fullName").value("Second"))
                .andExpect(jsonPath("$[1].fullName").value("First"));
    }

    @Test
    void userCannotListMessages() throws Exception {
        mockMvc.perform(get("/api/admin/contact-messages")
                        .with(user("user").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousUserCannotListMessages() throws Exception {
        mockMvc.perform(get("/api/admin/contact-messages"))
                .andExpect(status().isForbidden());
    }

    private String validRequest(String fullName, String email, String message) throws Exception {
        return objectMapper.writeValueAsString(requestMap(fullName, email, "09 123 456 789", message));
    }

    private Map<String, String> requestMap(
            String fullName,
            String email,
            String phone,
            String message) {
        return Map.of(
                "fullName", fullName,
                "email", email,
                "phone", phone,
                "message", message
        );
    }
}
