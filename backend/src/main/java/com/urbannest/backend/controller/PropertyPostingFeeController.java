package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyPostingFeeResponse;
import com.urbannest.backend.service.PropertyPostingFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/property-posting-fees")
@RequiredArgsConstructor
public class PropertyPostingFeeController {

    private final PropertyPostingFeeService service;

    @GetMapping
    public ResponseEntity<List<PropertyPostingFeeResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
