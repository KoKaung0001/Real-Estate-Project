package com.urbannest.backend.controller;

import com.urbannest.backend.service.PropertyImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final PropertyImageStorageService propertyImageStorageService;

    @PostMapping(value = "/properties", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPropertyImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("url", propertyImageStorageService.store(file)));
    }
}
