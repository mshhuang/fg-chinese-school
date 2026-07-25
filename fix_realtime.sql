-- Add all necessary tables to the realtime publication
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
