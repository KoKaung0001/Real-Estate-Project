package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyPostingFeeResponse;
import com.urbannest.backend.dto.UpdatePropertyPostingFeeRequest;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.service.PropertyPostingFeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/property-posting-fees")
@RequiredArgsConstructor
public class AdminPropertyPostingFeeController {

    private final PropertyPostingFeeService service;

    @PutMapping("/{propertyType}")
    public ResponseEntity<PropertyPostingFeeResponse> update(
            @PathVariable PropertyType propertyType,
            @Valid @RequestBody UpdatePropertyPostingFeeRequest request) {
        return ResponseEntity.ok(service.update(propertyType, request.feeAmount()));
    }
}
