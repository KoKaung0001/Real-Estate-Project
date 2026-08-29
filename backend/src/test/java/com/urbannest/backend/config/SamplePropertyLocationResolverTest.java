package com.urbannest.backend.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SamplePropertyLocationResolverTest {

    @Test
    void resolvesEveryBundledWorkbookTownshipAlias() {
        String[] bundledTownships = {
                "ကမာရွတ်", "ကြည့်မြင်တိုင်", "စမ်းချောင်း", "တာမွေ", "တောင်ဒဂုံ",
                "တောင်ဥက္ကလာပ", "ဒဂုံ", "ဒဂုံဆိပ်ကမ်း", "ဒေါပုံ", "ပန်းပဲတန်း",
                "ပုဇွန်တောင်", "ဗိုလ်တထောင်", "မင်္ဂလာတောင်ညွန့်", "မရမ်းကုန်း",
                "မြောက်ဒဂုံ", "မြောက်ဥက္ကလာပ", "ရန်ကင်း", "လမ်းမတော်", "လသာ",
                "လှိုင်", "သင်္ဃန်းကျွန်း", "သန်လျင်", "သာကေတ", "အလုံ"
        };

        for (String township : bundledTownships) {
            assertTrue(
                    SamplePropertyLocationResolver.resolve(township).isPresent(),
                    () -> "Expected bundled township to resolve: " + township
            );
        }
    }

    @Test
    void resolvesDagonVariantsWithoutCollapsingThem() {
        assertTownship("ဒဂုံ", "Dagon");
        assertTownship("မြောက်ဒဂုံ", "North Dagon");
        assertTownship("တောင်ဒဂုံ", "South Dagon");
        assertTownship("အရှေ့ဒဂုံ", "East Dagon");
        assertTownship("ဒဂုံဆိပ်ကမ်း", "Dagon Seikkan");
    }

    @Test
    void leavesUnknownOrAmbiguousLocationUnresolved() {
        assertTrue(SamplePropertyLocationResolver.resolve("Near Dagon").isEmpty());
        assertTrue(SamplePropertyLocationResolver.resolve("Unknown Township").isEmpty());
    }

    @Test
    void doesNotLabelThanlyinAsYangonCity() {
        SamplePropertyLocationResolver.StructuredLocation location =
                SamplePropertyLocationResolver.resolve("သန်လျင်").orElseThrow();

        assertEquals("Thanlyin", location.township());
        assertNull(location.city());
        assertEquals("Yangon Region", location.stateRegion());
    }

    private void assertTownship(String alias, String expectedTownship) {
        assertEquals(
                expectedTownship,
                SamplePropertyLocationResolver.resolve(alias).orElseThrow().township()
        );
    }
}
