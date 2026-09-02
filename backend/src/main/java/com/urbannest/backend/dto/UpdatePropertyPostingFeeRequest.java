package com.urbannest.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record UpdatePropertyPostingFeeRequest(
        @NotNull
        @PositiveOrZero
        @Digits(integer = 12, fraction = 0)
        BigDecimal feeAmount
) {
}
