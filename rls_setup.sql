-- Enable Row Level Security on all active tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;

-- Note: Because this application handles authentication via local storage
-- simulation for the demo / preview environment (instead of native Supabase Auth JWTs),
-- standard Postgres RLS policies using `auth.uid()` cannot verify the user identity.
-- To allow the app\'s frontend features (create/edit/delete) to function correctly
-- while having RLS formally enabled, you can provide wide-open read/write capabilities
-- using the anon key until native Supabase Auth is integrated.

DROP POLICY IF EXISTS "Enable all for users" ON users;
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for roles" ON roles;
CREATE POLICY "Enable all for roles" ON roles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for user_roles" ON user_roles;
CREATE POLICY "Enable all for user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for classes" ON classes;
CREATE POLICY "Enable all for classes" ON classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for programs" ON programs;
CREATE POLICY "Enable all for programs" ON programs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for subjects" ON subjects;
CREATE POLICY "Enable all for subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for periods" ON periods;
CREATE POLICY "Enable all for periods" ON periods FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for rooms" ON rooms;
CREATE POLICY "Enable all for rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for parent_child" ON parent_child;
CREATE POLICY "Enable all for parent_child" ON parent_child FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for enrollments" ON enrollments;
CREATE POLICY "Enable all for enrollments" ON enrollments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for announcements" ON announcements;
CREATE POLICY "Enable all for announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for announcement_replies" ON announcement_replies;
CREATE POLICY "Enable all for announcement_replies" ON announcement_replies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for newsletters" ON newsletters;
CREATE POLICY "Enable all for newsletters" ON newsletters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for system_logs" ON system_logs;
CREATE POLICY "Enable all for system_logs" ON system_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for error_logs" ON error_logs;
CREATE POLICY "Enable all for error_logs" ON error_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for user_sessions" ON user_sessions;
CREATE POLICY "Enable all for user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for internal_messages" ON internal_messages;
CREATE POLICY "Enable all for internal_messages" ON internal_messages FOR ALL USING (true) WITH CHECK (true);
