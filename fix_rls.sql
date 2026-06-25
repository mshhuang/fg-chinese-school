-- enable RLS on the new tables
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_students ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted access (since we are doing local auth)
DROP POLICY IF EXISTS "Enable all for lesson_plans" ON lesson_plans;
CREATE POLICY "Enable all for lesson_plans" ON lesson_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for assignments" ON assignments;
CREATE POLICY "Enable all for assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for assignment_students" ON assignment_students;
CREATE POLICY "Enable all for assignment_students" ON assignment_students FOR ALL USING (true) WITH CHECK (true);
