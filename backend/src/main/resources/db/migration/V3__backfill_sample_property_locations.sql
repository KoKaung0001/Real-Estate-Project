WITH sample_location_map (legacy_location, township, city, state_region) AS (
    VALUES
        ('ကမာရွတ်', 'Kamaryut', 'Yangon', 'Yangon Region'),
        ('ကြည့်မြင်တိုင်', 'Kyimyindaing', 'Yangon', 'Yangon Region'),
        ('စမ်းချောင်း', 'Sanchaung', 'Yangon', 'Yangon Region'),
        ('တာမွေ', 'Tamwe', 'Yangon', 'Yangon Region'),
        ('တောင်ဒဂုံ', 'South Dagon', 'Yangon', 'Yangon Region'),
        ('တောင်ဥက္ကလာပ', 'South Okkalapa', 'Yangon', 'Yangon Region'),
        ('ဒဂုံ', 'Dagon', 'Yangon', 'Yangon Region'),
        ('ဒဂုံဆိပ်ကမ်း', 'Dagon Seikkan', 'Yangon', 'Yangon Region'),
        ('ဒေါပုံ', 'Dawbon', 'Yangon', 'Yangon Region'),
        ('ပန်းပဲတန်း', 'Pabedan', 'Yangon', 'Yangon Region'),
        ('ပုဇွန်တောင်', 'Pazundaung', 'Yangon', 'Yangon Region'),
        ('ဗိုလ်တထောင်', 'Botahtaung', 'Yangon', 'Yangon Region'),
        ('မင်္ဂလာတောင်ညွန့်', 'Mingala Taungnyunt', 'Yangon', 'Yangon Region'),
        ('မရမ်းကုန်း', 'Mayangone', 'Yangon', 'Yangon Region'),
        ('မြောက်ဒဂုံ', 'North Dagon', 'Yangon', 'Yangon Region'),
        ('မြောက်ဥက္ကလာပ', 'North Okkalapa', 'Yangon', 'Yangon Region'),
        ('ရန်ကင်း', 'Yankin', 'Yangon', 'Yangon Region'),
        ('လမ်းမတော်', 'Lanmadaw', 'Yangon', 'Yangon Region'),
        ('လသာ', 'Latha', 'Yangon', 'Yangon Region'),
        ('လှိုင်', 'Hlaing', 'Yangon', 'Yangon Region'),
        ('သင်္ဃန်းကျွန်း', 'Thingangyun', 'Yangon', 'Yangon Region'),
        ('သန်လျင်', 'Thanlyin', NULL, 'Yangon Region'),
        ('သာကေတ', 'Thaketa', 'Yangon', 'Yangon Region'),
        ('အလုံ', 'Ahlone', 'Yangon', 'Yangon Region')
)
UPDATE properties AS property
SET township = COALESCE(property.township, mapping.township),
    city = COALESCE(property.city, mapping.city),
    state_region = COALESCE(property.state_region, mapping.state_region)
FROM users AS owner, sample_location_map AS mapping
WHERE property.owner_id = owner.id
  AND owner.username = '_sample_data'
  AND property.location = mapping.legacy_location
  AND (
      property.township IS NULL
      OR property.city IS NULL AND mapping.city IS NOT NULL
      OR property.state_region IS NULL
  );
