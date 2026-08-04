-- Initial schema setup for the school management system
-- Run this in the Supabase SQL Editor of your new project.

-- 1. Create tables
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone1 TEXT,
    phone2 TEXT,
    school TEXT,
    grade TEXT,
    dob DATE,
    user_name TEXT,
    address TEXT,
    emergency_contact TEXT,
    medical_condition TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS parent_child (
    parent_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    child_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    relationship_type TEXT,
    PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS programs (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name TEXT NOT NULL,
    school_year_or_term TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT NOT NULL,
    building TEXT
);

CREATE TABLE IF NOT EXISTS classes (
    class_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    primary_teacher_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    co_teacher_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    co_teachers UUID[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS class_schedule (
    schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    day_of_week TEXT,
    period TEXT
);

CREATE TABLE IF NOT EXISTS periods (
    period_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL,
    time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_subject (
    teacher_subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_template (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_day TEXT,
    period_id UUID REFERENCES periods(period_id) ON DELETE SET NULL,
    class_id UUID REFERENCES classes(class_id) ON DELETE SET NULL,
    teacher_subject_id UUID REFERENCES teacher_subject(teacher_subject_id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS schedule_overrides (
    override_id SERIAL PRIMARY KEY,
    class_id UUID REFERENCES classes(class_id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(room_id) ON DELETE SET NULL,
    period_id UUID REFERENCES periods(period_id) ON DELETE SET NULL,
    teacher_subject_id UUID REFERENCES teacher_subject(teacher_subject_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    effective_date DATE,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(program_id) ON DELETE SET NULL,
    notes TEXT,
    status TEXT,
    enrollment_date DATE,
    drop_date DATE
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id SERIAL PRIMARY KEY,
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    marked_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    is_present BOOLEAN
);

CREATE TABLE IF NOT EXISTS lesson_plans (
    lesson_plan_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content_rich_text TEXT,
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS newsletters (
    newsletter_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS announcements (
    announcement_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_by UUID REFERENCES users(user_id) ON DELETE CASCADE,
    target_role_id INTEGER REFERENCES roles(role_id) ON DELETE SET NULL,
    target_program_id UUID REFERENCES programs(program_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id SERIAL PRIMARY KEY,
    class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_students (
    assignment_student_id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    status TEXT,
    grade TEXT,
    feedback TEXT,
    UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS internal_messages (
    message_id SERIAL PRIMARY KEY,
    subject TEXT,
    body TEXT,
    sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_logs (
    log_id SERIAL PRIMARY KEY,
    log_level TEXT,
    message TEXT,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action_type TEXT DEFAULT 'other'
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ DEFAULT NOW(),
    logout_time TIMESTAMPTZ,
    device_info TEXT
);

-- 2. Insert basic roles
INSERT INTO roles (role_name) VALUES
    ('Builder'),
    ('Admin'),
    ('Principal'),
    ('Teacher'),
    ('Staff'),
    ('Volunteer'),
    ('Parent'),
    ('Student')
ON CONFLICT (role_name) DO NOTHING;

-- 3. Insert default Builder user
INSERT INTO users (user_id, first_name, last_name, email, user_name, password_hash, status)
VALUES (
    'ec13df7f-1a4f-422e-abd8-05732ca798d2',
    'System',
    'Builder',
    'builder@example.com',
    'admin',
    'builder123',
    'Active'
) ON CONFLICT (email) DO NOTHING;

-- Assign builder role
INSERT INTO user_roles (user_id, role_id)
SELECT 'ec13df7f-1a4f-422e-abd8-05732ca798d2', role_id FROM roles WHERE role_name = 'Builder'
ON CONFLICT DO NOTHING;

-- 4. Enable Row Level Security (Allow all for development)
DO $$ 
DECLARE 
    tname text;
BEGIN
    FOR tname IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'ALTER TABLE ' || tname || ' ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'DROP POLICY IF EXISTS "Enable all for ' || tname || '" ON ' || tname || ';';
        EXECUTE 'CREATE POLICY "Enable all for ' || tname || '" ON ' || tname || ' FOR ALL USING (true) WITH CHECK (true);';
    END LOOP;
END $$;
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,
    error_code TEXT,
    error_details TEXT,
    request_url TEXT,
    request_method TEXT,
    user_id UUID,
    browser_info TEXT
);
