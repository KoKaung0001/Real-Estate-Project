package com.urbannest.backend.support;

import com.urbannest.backend.entity.PropertyType;

public final class SamplePropertyShowcase {

    public static final String USERNAME = "_sample_data";
    public static final String DISPLAY_NAME = "UrbanNest Demo Agent";
    public static final String PHONE = "09 000 000 001";

    private SamplePropertyShowcase() {
    }

    public static String ownerDisplayName(String username) {
        return USERNAME.equals(username) ? DISPLAY_NAME : username;
    }

    public static int bedrooms(PropertyType propertyType, double area) {
        return switch (propertyType) {
            case LAND -> 0;
            case APARTMENT, CONDO -> area < 600 ? 1 : area < 1_000 ? 2 : area < 1_500 ? 3 : 4;
            case HOUSE, TOWNHOUSE -> area < 1_000 ? 2 : area < 1_600 ? 3 : area < 2_400 ? 4 : 5;
        };
    }

    public static int bathrooms(PropertyType propertyType, double area) {
        return switch (propertyType) {
            case LAND -> 0;
            case APARTMENT, CONDO -> area < 700 ? 1 : area < 1_400 ? 2 : 3;
            case HOUSE, TOWNHOUSE -> area < 1_200 ? 2 : area < 2_200 ? 3 : 4;
        };
    }
}
