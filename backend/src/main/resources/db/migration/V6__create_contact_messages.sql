CREATE TABLE contact_messages (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(40),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contact_messages_full_name_not_blank CHECK (BTRIM(full_name) <> ''),
    CONSTRAINT contact_messages_email_not_blank CHECK (BTRIM(email) <> ''),
    CONSTRAINT contact_messages_phone_length CHECK (phone IS NULL OR CHAR_LENGTH(phone) <= 40),
    CONSTRAINT contact_messages_message_not_blank CHECK (BTRIM(message) <> ''),
    CONSTRAINT contact_messages_message_length CHECK (CHAR_LENGTH(message) <= 5000)
);

CREATE INDEX contact_messages_created_at_idx
    ON contact_messages (created_at DESC, id DESC);
