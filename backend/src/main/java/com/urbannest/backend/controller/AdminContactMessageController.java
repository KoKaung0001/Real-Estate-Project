package com.urbannest.backend.controller;

import com.urbannest.backend.dto.ContactMessageResponse;
import com.urbannest.backend.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact-messages")
@RequiredArgsConstructor
public class AdminContactMessageController {

    private final ContactMessageService service;

    @GetMapping
    public ResponseEntity<List<ContactMessageResponse>> getAll() {
        return ResponseEntity.ok(service.getAllNewestFirst());
    }
}
