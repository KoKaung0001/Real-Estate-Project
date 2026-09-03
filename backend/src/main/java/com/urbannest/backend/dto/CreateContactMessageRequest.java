package com.urbannest.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactMessageRequest(
        @NotBlank
        @Size(max = 120)
        String fullName,

        @NotBlank
        @Email
        @Size(max = 254)
        String email,

        @Size(max = 40)
        String phone,

        @NotBlank
        @Size(max = 5000)
        String message
) {
}
