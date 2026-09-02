package com.urbannest.backend.support;

import com.urbannest.backend.entity.PropertyType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SamplePropertyShowcaseTest {

    @Test
    void assignsDeterministicResidentialValuesFromTypeAndArea() {
        assertEquals(1, SamplePropertyShowcase.bedrooms(PropertyType.APARTMENT, 500));
        assertEquals(1, SamplePropertyShowcase.bathrooms(PropertyType.APARTMENT, 500));
        assertEquals(3, SamplePropertyShowcase.bedrooms(PropertyType.CONDO, 1_200));
        assertEquals(2, SamplePropertyShowcase.bathrooms(PropertyType.CONDO, 1_200));
        assertEquals(5, SamplePropertyShowcase.bedrooms(PropertyType.HOUSE, 2_500));
        assertEquals(4, SamplePropertyShowcase.bathrooms(PropertyType.HOUSE, 2_500));
    }

    @Test
    void keepsLandAtZeroBedroomsAndBathrooms() {
        assertEquals(0, SamplePropertyShowcase.bedrooms(PropertyType.LAND, 5_000));
        assertEquals(0, SamplePropertyShowcase.bathrooms(PropertyType.LAND, 5_000));
    }

    @Test
    void replacesOnlyTheInternalSampleUsernameForPresentation() {
        assertEquals("UrbanNest Demo Agent", SamplePropertyShowcase.ownerDisplayName("_sample_data"));
        assertEquals("real-owner", SamplePropertyShowcase.ownerDisplayName("real-owner"));
    }
}
