import re

with open('src/pages/AdminEnrollments.tsx', 'r') as f:
    content = f.read()

content = content.replace("supabase.from('users').select('*')", "supabase.from('users').select('user_id, first_name, last_name, email')")
content = content.replace("supabase.from('enrollments').select('*')", "supabase.from('enrollments').select('enrollment_id, student_id, class_id, status, program_id')")

with open('src/pages/AdminEnrollments.tsx', 'w') as f:
    f.write(content)
