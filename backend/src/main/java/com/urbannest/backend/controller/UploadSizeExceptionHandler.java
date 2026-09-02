package com.urbannest.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class UploadSizeExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleOversizedUpload() {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(Map.of("message", "Image is too large. Maximum file size is 5 MB."));
    }
}
