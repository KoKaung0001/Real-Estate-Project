package com.urbannest.backend.dto;

import com.urbannest.backend.entity.PropertyType;

import java.math.BigDecimal;

public record PropertyPostingFeeResponse(PropertyType propertyType, BigDecimal feeAmount) {
}
