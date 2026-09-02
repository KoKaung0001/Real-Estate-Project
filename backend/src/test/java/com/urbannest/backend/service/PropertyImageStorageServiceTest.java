package com.urbannest.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PropertyImageStorageServiceTest {

    @TempDir
    Path temporaryDirectory;

    @Test
    void storesValidatedImageWithGeneratedFilename() throws Exception {
        PropertyImageStorageService service = new PropertyImageStorageService(temporaryDirectory.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../../client-name.exe",
                "image/jpeg",
                new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01, 0x02}
        );

        String url = service.store(file);

        assertTrue(url.matches("/uploads/properties/[0-9a-f-]{36}\\.jpg"));
        assertTrue(Files.exists(temporaryDirectory.resolve("properties").resolve(Path.of(url).getFileName())));
    }

    @Test
    void rejectsEmptyFile() {
        PropertyImageStorageService service = new PropertyImageStorageService(temporaryDirectory.toString());
        MockMultipartFile file = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.store(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("The selected image is empty. Please choose another file.", exception.getReason());
    }

    @Test
    void rejectsUnsupportedOrSpoofedContent() {
        PropertyImageStorageService service = new PropertyImageStorageService(temporaryDirectory.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "fake.png",
                "image/png",
                new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01}
        );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.store(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("The selected file does not appear to be a valid image.", exception.getReason());
    }

    @Test
    void rejectsUnsupportedContentType() {
        PropertyImageStorageService service = new PropertyImageStorageService(temporaryDirectory.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "property.svg",
                "image/svg+xml",
                "<svg></svg>".getBytes()
        );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.store(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals(
                "Unsupported image format. Please upload a JPEG, PNG, or WebP image.",
                exception.getReason()
        );
    }

    @Test
    void rejectsFilesLargerThanFiveMegabytes() {
        PropertyImageStorageService service = new PropertyImageStorageService(temporaryDirectory.toString());
        byte[] oversized = new byte[(int) PropertyImageStorageService.MAX_FILE_SIZE + 1];
        oversized[0] = (byte) 0xFF;
        oversized[1] = (byte) 0xD8;
        oversized[2] = (byte) 0xFF;
        MockMultipartFile file = new MockMultipartFile("file", "large.jpg", "image/jpeg", oversized);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.store(file));

        assertEquals(HttpStatus.CONTENT_TOO_LARGE, exception.getStatusCode());
        assertEquals("Image is too large. Maximum file size is 5 MB.", exception.getReason());
    }
}
