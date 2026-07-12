import re

with open('supabase_schema_updates.sql', 'r') as f:
    content = f.read()

# Remove the previously added ALTER TABLE commands at the end
content = re.sub(r'-- Add activity_status to track detailed status for students.*?$', '', content, flags=re.DOTALL)

# Add the new student_clock_ins table and the status fields
content += """
-- Add daily_status to staff_clock_ins
ALTER TABLE staff_clock_ins ADD COLUMN IF NOT EXISTS daily_status TEXT DEFAULT 'not arrive yet';

-- Create student_clock_ins table for student building check in/out and status
CREATE TABLE IF NOT EXISTS student_clock_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    daily_status TEXT DEFAULT 'not arrive yet',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_clock_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for student_clock_ins" ON student_clock_ins;
CREATE POLICY "Enable all for student_clock_ins" ON student_clock_ins FOR ALL USING (true) WITH CHECK (true);
"""

with open('supabase_schema_updates.sql', 'w') as f:
    f.write(content)

print("Schema updated!")
