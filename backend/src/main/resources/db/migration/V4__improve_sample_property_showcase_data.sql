UPDATE users
SET phone = '09 000 000 001'
WHERE username = '_sample_data'
  AND phone = '0000000000';

UPDATE properties AS property
SET bedrooms = CASE
        WHEN property.property_type = 'LAND' THEN 0
        WHEN property.property_type IN ('APARTMENT', 'CONDO') THEN
            CASE
                WHEN property.area < 600 THEN 1
                WHEN property.area < 1000 THEN 2
                WHEN property.area < 1500 THEN 3
                ELSE 4
            END
        ELSE
            CASE
                WHEN property.area < 1000 THEN 2
                WHEN property.area < 1600 THEN 3
                WHEN property.area < 2400 THEN 4
                ELSE 5
            END
    END,
    bathrooms = CASE
        WHEN property.property_type = 'LAND' THEN 0
        WHEN property.property_type IN ('APARTMENT', 'CONDO') THEN
            CASE
                WHEN property.area < 700 THEN 1
                WHEN property.area < 1400 THEN 2
                ELSE 3
            END
        ELSE
            CASE
                WHEN property.area < 1200 THEN 2
                WHEN property.area < 2200 THEN 3
                ELSE 4
            END
    END
FROM users AS owner
WHERE property.owner_id = owner.id
  AND owner.username = '_sample_data'
  AND (
      property.bedrooms IS NULL
      OR property.bedrooms <= 0
      OR property.bathrooms IS NULL
      OR property.bathrooms <= 0
  );
