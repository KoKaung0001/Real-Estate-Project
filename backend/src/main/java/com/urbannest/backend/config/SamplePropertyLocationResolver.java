package com.urbannest.backend.config;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

final class SamplePropertyLocationResolver {

    private static final String YANGON = "Yangon";
    private static final String YANGON_REGION = "Yangon Region";
    private static final Map<String, StructuredLocation> LOCATIONS_BY_ALIAS = createLocationsByAlias();

    private SamplePropertyLocationResolver() {
    }

    static Optional<StructuredLocation> resolve(String legacyLocation) {
        if (legacyLocation == null || legacyLocation.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(LOCATIONS_BY_ALIAS.get(normalize(legacyLocation)));
    }

    private static Map<String, StructuredLocation> createLocationsByAlias() {
        Map<String, StructuredLocation> locations = new HashMap<>();

        registerYangon(locations, "Kamaryut", "ကမာရွတ်");
        registerYangon(locations, "Kyimyindaing", "ကြည့်မြင်တိုင်");
        registerYangon(locations, "Sanchaung", "စမ်းချောင်း");
        registerYangon(locations, "Tamwe", "တာမွေ");
        registerYangon(locations, "South Okkalapa", "တောင်ဥက္ကလာပ");
        registerYangon(locations, "Dawbon", "ဒေါပုံ");
        registerYangon(locations, "Pabedan", "ပန်းပဲတန်း");
        registerYangon(locations, "Pazundaung", "ပုဇွန်တောင်");
        registerYangon(locations, "Botahtaung", "ဗိုလ်တထောင်");
        registerYangon(locations, "Mingala Taungnyunt", "မင်္ဂလာတောင်ညွန့်");
        registerYangon(locations, "Mayangone", "မရမ်းကုန်း");
        registerYangon(locations, "North Okkalapa", "မြောက်ဥက္ကလာပ");
        registerYangon(locations, "Yankin", "ရန်ကင်း");
        registerYangon(locations, "Lanmadaw", "လမ်းမတော်");
        registerYangon(locations, "Latha", "လသာ");
        registerYangon(locations, "Hlaing", "လှိုင်");
        registerYangon(locations, "Thingangyun", "သင်္ဃန်းကျွန်း");
        registerYangon(locations, "Thaketa", "သာကေတ");
        registerYangon(locations, "Ahlone", "အလုံ");

        registerYangon(locations, "Dagon", "ဒဂုံ");
        registerYangon(
                locations,
                "North Dagon",
                "မြောက်ဒဂုံ",
                "Dagon Myothit (North)",
                "ဒဂုံမြို့သစ်(မြောက်ပိုင်း)"
        );
        registerYangon(
                locations,
                "South Dagon",
                "တောင်ဒဂုံ",
                "Dagon Myothit (South)",
                "ဒဂုံမြို့သစ်(တောင်ပိုင်း)"
        );
        registerYangon(
                locations,
                "East Dagon",
                "အရှေ့ဒဂုံ",
                "Dagon Myothit (East)",
                "ဒဂုံမြို့သစ်(အရှေ့ပိုင်း)"
        );
        registerYangon(locations, "Dagon Seikkan", "ဒဂုံဆိပ်ကမ်း", "ဒဂုံဆိပ်ကမ်းမြို့နယ်");

        register(
                locations,
                new StructuredLocation("Thanlyin", null, YANGON_REGION),
                "Thanlyin",
                "သန်လျင်"
        );

        return Map.copyOf(locations);
    }

    private static void registerYangon(
            Map<String, StructuredLocation> locations,
            String township,
            String... aliases
    ) {
        register(locations, new StructuredLocation(township, YANGON, YANGON_REGION), township, aliases);
    }

    private static void register(
            Map<String, StructuredLocation> locations,
            StructuredLocation structuredLocation,
            String township,
            String... aliases
    ) {
        putAlias(locations, township, structuredLocation);
        putAlias(locations, township + " Township", structuredLocation);
        for (String alias : aliases) {
            putAlias(locations, alias, structuredLocation);
        }
    }

    private static void putAlias(
            Map<String, StructuredLocation> locations,
            String alias,
            StructuredLocation structuredLocation
    ) {
        StructuredLocation previous = locations.put(normalize(alias), structuredLocation);
        if (previous != null && !previous.equals(structuredLocation)) {
            throw new IllegalStateException("Conflicting sample township alias: " + alias);
        }
    }

    private static String normalize(String value) {
        return value.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    record StructuredLocation(String township, String city, String stateRegion) {
    }
}
