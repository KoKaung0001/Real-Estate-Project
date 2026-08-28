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
