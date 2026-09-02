CREATE TABLE property_posting_fees (
    property_type VARCHAR(255) PRIMARY KEY,
    fee_amount NUMERIC(12, 0) NOT NULL,
    CONSTRAINT property_posting_fees_type_check
        CHECK (property_type IN ('APARTMENT', 'HOUSE', 'CONDO', 'LAND', 'TOWNHOUSE')),
    CONSTRAINT property_posting_fees_amount_check
        CHECK (fee_amount >= 0)
);

INSERT INTO property_posting_fees (property_type, fee_amount)
VALUES
    ('APARTMENT', 100000),
    ('HOUSE', 300000),
    ('CONDO', 500000),
    ('LAND', 100000);
