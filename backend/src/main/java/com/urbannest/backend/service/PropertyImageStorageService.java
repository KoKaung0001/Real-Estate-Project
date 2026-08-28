package com.urbannest.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@Service
public class PropertyImageStorageService {

    public static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private final Path propertyUploadDirectory;

    public PropertyImageStorageService(@Value("${app.upload-dir:uploads}") String uploadDirectory) {
        Path uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.propertyUploadDirectory = uploadRoot.resolve("properties").normalize();

        if (!propertyUploadDirectory.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Invalid property upload directory");
        }

        try {
            Files.createDirectories(propertyUploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to create the property upload directory", exception);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "Image must not exceed 5 MB");
        }

        ImageType imageType = detectImageType(file);
        String declaredContentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        if (imageType == null || !imageType.contentType.equals(declaredContentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPEG, PNG, and WebP images are supported"
            );
        }

        String generatedFilename = UUID.randomUUID() + imageType.extension;
        Path destination = propertyUploadDirectory.resolve(generatedFilename).normalize();
        if (!destination.startsWith(propertyUploadDirectory)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload destination");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store image",
                    exception
            );
        }

        return "/uploads/properties/" + generatedFilename;
    }

    public String getPropertyDirectoryUri() {
        String uri = propertyUploadDirectory.toUri().toString();
        return uri.endsWith("/") ? uri : uri + "/";
    }

    private ImageType detectImageType(MultipartFile file) {
        byte[] header = new byte[12];
        int bytesRead;
        try (InputStream inputStream = file.getInputStream()) {
            bytesRead = inputStream.read(header);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read image", exception);
        }

        if (bytesRead >= 3
                && unsigned(header[0]) == 0xFF
                && unsigned(header[1]) == 0xD8
                && unsigned(header[2]) == 0xFF) {
            return ImageType.JPEG;
        }
        if (bytesRead >= 8
                && unsigned(header[0]) == 0x89
                && header[1] == 'P'
                && header[2] == 'N'
                && header[3] == 'G'
                && unsigned(header[4]) == 0x0D
                && unsigned(header[5]) == 0x0A
                && unsigned(header[6]) == 0x1A
                && unsigned(header[7]) == 0x0A) {
            return ImageType.PNG;
        }
        if (bytesRead >= 12
                && header[0] == 'R'
                && header[1] == 'I'
                && header[2] == 'F'
                && header[3] == 'F'
                && header[8] == 'W'
                && header[9] == 'E'
                && header[10] == 'B'
                && header[11] == 'P') {
            return ImageType.WEBP;
        }
        return null;
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private enum ImageType {
        JPEG("image/jpeg", ".jpg"),
        PNG("image/png", ".png"),
        WEBP("image/webp", ".webp");

        private final String contentType;
        private final String extension;

        ImageType(String contentType, String extension) {
            this.contentType = contentType;
            this.extension = extension;
        }
    }
}
