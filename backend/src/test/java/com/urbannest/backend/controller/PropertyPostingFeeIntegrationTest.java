package com.urbannest.backend.controller;

import com.urbannest.backend.entity.PropertyPostingFee;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.repository.PropertyPostingFeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PropertyPostingFeeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyPostingFeeRepository repository;

    @BeforeEach
    void restoreDefaults() {
        repository.saveAll(List.of(
                new PropertyPostingFee(PropertyType.APARTMENT, BigDecimal.valueOf(100_000)),
                new PropertyPostingFee(PropertyType.HOUSE, BigDecimal.valueOf(300_000)),
                new PropertyPostingFee(PropertyType.CONDO, BigDecimal.valueOf(500_000)),
                new PropertyPostingFee(PropertyType.LAND, BigDecimal.valueOf(100_000))
        ));
        repository.flush();
    }

    @Test
    void migrationProvidesDefaultFees() {
        assertEquals(BigDecimal.valueOf(100_000), repository.findById(PropertyType.APARTMENT).orElseThrow().getFeeAmount());
        assertEquals(BigDecimal.valueOf(300_000), repository.findById(PropertyType.HOUSE).orElseThrow().getFeeAmount());
        assertEquals(BigDecimal.valueOf(500_000), repository.findById(PropertyType.CONDO).orElseThrow().getFeeAmount());
        assertEquals(BigDecimal.valueOf(100_000), repository.findById(PropertyType.LAND).orElseThrow().getFeeAmount());
    }

    @Test
    void publicGetReturnsConfiguredFees() throws Exception {
        mockMvc.perform(get("/api/property-posting-fees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].propertyType").value("APARTMENT"))
                .andExpect(jsonPath("$[0].feeAmount").value(100_000))
                .andExpect(jsonPath("$[1].propertyType").value("HOUSE"))
                .andExpect(jsonPath("$[2].propertyType").value("CONDO"))
                .andExpect(jsonPath("$[3].propertyType").value("LAND"));
    }

    @Test
    void userCannotUpdateFee() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                        .with(user("normal-user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":150000}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousUserCannotUpdateFee() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":150000}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanUpdateAndPersistFee() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":150000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyType").value("APARTMENT"))
                .andExpect(jsonPath("$.feeAmount").value(150_000));

        repository.flush();
        assertEquals(BigDecimal.valueOf(150_000), repository.findById(PropertyType.APARTMENT).orElseThrow().getFeeAmount());
    }

    @Test
    void negativeNullAndDecimalFeesAreRejected() throws Exception {
        for (String body : List.of(
                "{\"feeAmount\":-1}",
                "{\"feeAmount\":null}",
                "{\"feeAmount\":100.5}"
        )) {
            mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                            .with(user("admin").roles("ADMIN"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void invalidAndLegacyOnlyPropertyTypesCannotBeUpdated() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/NOT_A_TYPE")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":100000}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/admin/property-posting-fees/TOWNHOUSE")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":100000}"))
                .andExpect(status().isNotFound());
    }
}
