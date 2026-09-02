package com.urbannest.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "property_posting_fees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyPostingFee {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;

    @Column(name = "fee_amount", nullable = false, precision = 12, scale = 0)
    private BigDecimal feeAmount;
}
