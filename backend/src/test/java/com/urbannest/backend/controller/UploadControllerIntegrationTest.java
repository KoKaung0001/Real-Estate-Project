package com.urbannest.backend.controller;

import com.urbannest.backend.security.CustomUserDetailsService;
import com.urbannest.backend.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.upload-dir=build/test-uploads"
)
class UploadControllerIntegrationTest {

    private static final Pattern URL_PATTERN = Pattern.compile("\\\"url\\\":\\\"([^\\\"]+)\\\"");
    private static final Pattern MESSAGE_PATTERN = Pattern.compile("\\\"message\\\":\\\"([^\\\"]+)\\\"");
    private static final String TEST_USERNAME = "upload-jwt-user";

    @Autowired
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @LocalServerPort
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private String jwt;

    @BeforeEach
    void createJwt() {
        UserDetails user = User.withUsername(TEST_USERNAME)
                .password("unused-test-password")
                .roles("USER")
                .build();
        when(userDetailsService.loadUserByUsername(TEST_USERNAME)).thenReturn(user);
        jwt = jwtProvider.generateToken(user);
    }

    @Test
    void authenticatedUserCanUploadAndAnonymousUserCanReadImage() throws Exception {
        HttpResponse<String> uploadResponse = upload(jpegImage(), jwt);

        assertEquals(200, uploadResponse.statusCode());
        Matcher urlMatcher = URL_PATTERN.matcher(uploadResponse.body());
        assertTrue(urlMatcher.find());
        String imageUrl = urlMatcher.group(1);

        HttpResponse<byte[]> imageResponse = httpClient.send(
                HttpRequest.newBuilder(uri(imageUrl)).GET().build(),
                HttpResponse.BodyHandlers.ofByteArray()
        );

        assertEquals(200, imageResponse.statusCode());
        assertEquals("image/jpeg", imageResponse.headers().firstValue("Content-Type").orElseThrow());
    }

    @Test
    void authenticatedUserCanUploadPngAndWebpImages() throws Exception {
        assertEquals(200, upload(pngImage(), jwt).statusCode());
        assertEquals(200, upload(webpImage(), jwt).statusCode());
    }

    @Test
    void invalidAuthenticatedImagePreservesBadRequestInsteadOfBecomingForbidden() throws Exception {
        MockMultipartFile svg = new MockMultipartFile(
                "file",
                "property.svg",
                "image/svg+xml",
                "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>".getBytes(StandardCharsets.UTF_8)
        );

        HttpResponse<String> response = upload(svg, jwt);

        assertEquals(400, response.statusCode());
        assertNotEquals(403, response.statusCode());
        assertMessage(response, "Unsupported image format. Please upload a JPEG, PNG, or WebP image.");
    }

    @Test
    void spoofedAuthenticatedImageReturnsReadableBadRequest() throws Exception {
        MockMultipartFile spoofed = new MockMultipartFile(
                "file",
                "renamed.jpg",
                "image/jpeg",
                "not really a jpeg".getBytes(StandardCharsets.UTF_8)
        );

        HttpResponse<String> response = upload(spoofed, jwt);

        assertEquals(400, response.statusCode());
        assertMessage(response, "The selected file does not appear to be a valid image.");
    }

    @Test
    void emptyAuthenticatedImageReturnsReadableBadRequest() throws Exception {
        HttpResponse<String> response = upload(
                new MockMultipartFile("file", "empty.png", "image/png", new byte[0]),
                jwt
        );

        assertEquals(400, response.statusCode());
        assertMessage(response, "The selected image is empty. Please choose another file.");
    }

    @Test
    void oversizedAuthenticatedImagePreservesPayloadTooLarge() throws Exception {
        byte[] oversizedJpeg = new byte[5 * 1024 * 1024 + 1];
        Arrays.fill(oversizedJpeg, (byte) 1);
        oversizedJpeg[0] = (byte) 0xFF;
        oversizedJpeg[1] = (byte) 0xD8;
        oversizedJpeg[2] = (byte) 0xFF;

        HttpResponse<String> response = upload(
                new MockMultipartFile("file", "large.jpg", "image/jpeg", oversizedJpeg),
                jwt
        );

        assertEquals(413, response.statusCode());
        assertNotEquals(403, response.statusCode());
        assertMessage(response, "Image is too large. Maximum file size is 5 MB.");
    }

    @Test
    void anonymousUserCannotUpload() throws Exception {
        HttpResponse<String> response = upload(jpegImage(), null);

        assertEquals(403, response.statusCode());
    }

    private MockMultipartFile jpegImage() {
        return new MockMultipartFile(
                "file",
                "property.jpg",
                "image/jpeg",
                new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01, 0x02}
        );
    }

    private MockMultipartFile pngImage() {
        return new MockMultipartFile(
                "file",
                "property.png",
                "image/png",
                new byte[]{(byte) 0x89, (byte) 'P', (byte) 'N', (byte) 'G', 0x0D, 0x0A, 0x1A, 0x0A}
        );
    }

    private MockMultipartFile webpImage() {
        return new MockMultipartFile(
                "file",
                "property.webp",
                "image/webp",
                new byte[]{(byte) 'R', (byte) 'I', (byte) 'F', (byte) 'F', 0x04, 0x00, 0x00, 0x00,
                        (byte) 'W', (byte) 'E', (byte) 'B', (byte) 'P'}
        );
    }

    private void assertMessage(HttpResponse<String> response, String expectedMessage) {
        Matcher messageMatcher = MESSAGE_PATTERN.matcher(response.body());
        assertTrue(messageMatcher.find());
        assertEquals(expectedMessage, messageMatcher.group(1));
    }

    private HttpResponse<String> upload(MockMultipartFile file, String bearerToken) throws Exception {
        String boundary = "----UrbanNestTestBoundary" + UUID.randomUUID();
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"file\"; filename=\""
                + file.getOriginalFilename() + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Type: " + file.getContentType() + "\r\n\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.write(file.getBytes());
        body.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

        HttpRequest.Builder request = HttpRequest.newBuilder(uri("/api/uploads/properties"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()));
        if (bearerToken != null) {
            request.header("Authorization", "Bearer " + bearerToken);
        }

        return httpClient.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }
}
