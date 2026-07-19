-- 1. Enable the network extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the notification function
CREATE OR REPLACE FUNCTION notify_ntfy_sh()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  action_type text := TG_OP;
  table_name text := TG_TABLE_NAME;
  should_notify boolean := true;
BEGIN
  -- Special filtering for system_logs
  IF table_name = 'system_logs' THEN
    IF action_type = 'INSERT' THEN
      IF NEW.action_type = 'login' 
         OR NEW.activity ILIKE '%issue%' 
         OR NEW.activity ILIKE '%report%'
         OR NEW.activity ILIKE '%[ERROR]%' THEN
        should_notify := true;
      ELSE
        should_notify := false;
      END IF;
    ELSE
      should_notify := false;
    END IF;
  END IF;

  IF should_notify THEN
    payload := jsonb_build_object(
      'topic', 'my_school_alerts_123',
      'title', 'DB Alert: ' || table_name,
      'message', action_type || ' detected on table: ' || table_name,
      'tags', ARRAY['bell', 'zap']
    );

    PERFORM net.http_post(
      url := 'https://ntfy.sh/',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
    );
  END IF;

  IF action_type = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Apply triggers to all 6 tables

-- system_logs
DROP TRIGGER IF EXISTS trigger_notify_ntfy_system_logs ON system_logs;
CREATE TRIGGER trigger_notify_ntfy_system_logs
AFTER INSERT ON system_logs
FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

-- internal_messages
DROP TRIGGER IF EXISTS trigger_notify_ntfy_internal_messages ON internal_messages;
CREATE TRIGGER trigger_notify_ntfy_internal_messages
AFTER INSERT OR UPDATE OR DELETE ON internal_messages
FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

-- assignments
DROP TRIGGER IF EXISTS trigger_notify_ntfy_assignments ON assignments;
CREATE TRIGGER trigger_notify_ntfy_assignments
AFTER INSERT OR UPDATE OR DELETE ON assignments
FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

-- error_logs
DROP TRIGGER IF EXISTS trigger_notify_ntfy_error_logs ON error_logs;
CREATE TRIGGER trigger_notify_ntfy_error_logs
AFTER INSERT OR UPDATE OR DELETE ON error_logs
FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

-- announcements
DROP TRIGGER IF EXISTS trigger_notify_ntfy_announcements ON announcements;
CREATE TRIGGER trigger_notify_ntfy_announcements
AFTER INSERT OR UPDATE OR DELETE ON announcements
FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

-- newsletters (Adding newsletters here)
DROP TRIGGER IF EXISTS trigger_notify_ntfy_newsletters ON newsletters;
CREATE TRIGGER trigger_notify_ntfy_newsletters
AFTER INSERT OR UPDATE OR DELETE ON newsletters
FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();
