-- 1. Re-enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Update the notification function
CREATE OR REPLACE FUNCTION notify_ntfy_sh()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  action_type text := TG_OP;
  table_name text := TG_TABLE_NAME;
  should_notify boolean := true;
  alert_title text := 'DB Alert: ' || table_name;
  alert_msg text := action_type || ' detected on table: ' || table_name;
BEGIN
  -- Special filtering for system_logs
  IF table_name = 'system_logs' THEN
    IF action_type = 'INSERT' THEN
      IF NEW.action_type = 'login' THEN
        should_notify := true;
        alert_title := 'User Login Alert';
        alert_msg := 'User ' || COALESCE(NEW.user_name, 'Unknown') || ' logged into the website.';
      ELSIF NEW.activity ILIKE '%issue%'
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

  -- Special formatting for class_photos
  IF table_name = 'class_photos' THEN
    IF action_type = 'INSERT' THEN
      should_notify := true;
      alert_title := 'New Photo Uploaded';
      alert_msg := 'Teacher ' || COALESCE(NEW.teacher_name, 'Unknown') || ' posted a new picture for their students.';
    ELSE
      should_notify := false;
    END IF;
  END IF;

  IF should_notify THEN
    payload := jsonb_build_object(
      'topic', 'my_school_alerts_123',
      'title', alert_title,
      'message', alert_msg,
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

-- 3. Re-create all triggers
DROP TRIGGER IF EXISTS trigger_notify_ntfy_system_logs ON system_logs;
CREATE TRIGGER trigger_notify_ntfy_system_logs AFTER INSERT ON system_logs FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

DROP TRIGGER IF EXISTS trigger_notify_ntfy_class_photos ON class_photos;
CREATE TRIGGER trigger_notify_ntfy_class_photos AFTER INSERT OR UPDATE OR DELETE ON class_photos FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

DROP TRIGGER IF EXISTS trigger_notify_ntfy_internal_messages ON internal_messages;
CREATE TRIGGER trigger_notify_ntfy_internal_messages AFTER INSERT OR UPDATE OR DELETE ON internal_messages FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

DROP TRIGGER IF EXISTS trigger_notify_ntfy_assignments ON assignments;
CREATE TRIGGER trigger_notify_ntfy_assignments AFTER INSERT OR UPDATE OR DELETE ON assignments FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

DROP TRIGGER IF EXISTS trigger_notify_ntfy_error_logs ON error_logs;
CREATE TRIGGER trigger_notify_ntfy_error_logs AFTER INSERT OR UPDATE OR DELETE ON error_logs FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

DROP TRIGGER IF EXISTS trigger_notify_ntfy_announcements ON announcements;
CREATE TRIGGER trigger_notify_ntfy_announcements AFTER INSERT OR UPDATE OR DELETE ON announcements FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

DROP TRIGGER IF EXISTS trigger_notify_ntfy_newsletters ON newsletters;
CREATE TRIGGER trigger_notify_ntfy_newsletters AFTER INSERT OR UPDATE OR DELETE ON newsletters FOR EACH ROW EXECUTE FUNCTION notify_ntfy_sh();

-- 4. Re-enable Realtime publication for in-app Dashboard Notifications
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
  ALTER PUBLICATION supabase_realtime ADD TABLE internal_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
  ALTER PUBLICATION supabase_realtime ADD TABLE newsletters;
  ALTER PUBLICATION supabase_realtime ADD TABLE staff_clock_ins;
  ALTER PUBLICATION supabase_realtime ADD TABLE student_clock_ins;
  ALTER PUBLICATION supabase_realtime ADD TABLE assignment_students;
COMMIT;
