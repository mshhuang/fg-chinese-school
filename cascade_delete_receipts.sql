-- Function to handle polymorphic cascade deletes for read_receipts
CREATE OR REPLACE FUNCTION cascade_delete_read_receipts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'announcements' THEN
        DELETE FROM read_receipts WHERE item_type = 'announcement' AND item_id = OLD.announcement_id;
    ELSIF TG_TABLE_NAME = 'newsletters' THEN
        DELETE FROM read_receipts WHERE item_type = 'newsletter' AND item_id = OLD.newsletter_id;
    ELSIF TG_TABLE_NAME = 'internal_messages' THEN
        DELETE FROM read_receipts WHERE item_type = 'message' AND item_id = OLD.message_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for announcements
DROP TRIGGER IF EXISTS trigger_cascade_delete_read_receipts_announcements ON announcements;
CREATE TRIGGER trigger_cascade_delete_read_receipts_announcements
AFTER DELETE ON announcements
FOR EACH ROW EXECUTE FUNCTION cascade_delete_read_receipts();

-- Trigger for newsletters
DROP TRIGGER IF EXISTS trigger_cascade_delete_read_receipts_newsletters ON newsletters;
CREATE TRIGGER trigger_cascade_delete_read_receipts_newsletters
AFTER DELETE ON newsletters
FOR EACH ROW EXECUTE FUNCTION cascade_delete_read_receipts();

-- Trigger for internal_messages
DROP TRIGGER IF EXISTS trigger_cascade_delete_read_receipts_internal_messages ON internal_messages;
CREATE TRIGGER trigger_cascade_delete_read_receipts_internal_messages
AFTER DELETE ON internal_messages
FOR EACH ROW EXECUTE FUNCTION cascade_delete_read_receipts();
