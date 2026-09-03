ALTER TABLE notifications
    DROP CONSTRAINT notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
        CHECK (type IN (
            'PROPERTY_APPROVED',
            'PROPERTY_REJECTED',
            'CONTACT_MESSAGE_RECEIVED',
            'PROPERTY_APPROVAL_REQUESTED',
            'PROPERTY_SUBMITTED'
        ));
