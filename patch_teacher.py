import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"\.from\('system_logs'\)\s*\.select\('\*'\)\s*\.eq\('user_id', currentUser\.id\)\s*\.in\('action_type', \['teacher_clock_in', 'teacher_clock_out'\]\)",
    r".from('staff_clock_ins')\n       .select('*')\n       .eq('user_id', currentUser.id)",
    content
)

content = re.sub(
    r"setClockStatus\(data\[0\]\.action_type === 'teacher_clock_in' \? 'clocked_in' : 'clocked_out'\);",
    r"setClockStatus(data[0].action_type === 'clock_in' ? 'clocked_in' : 'clocked_out');",
    content
)

content = re.sub(
    r"const \{ error \} = await supabase\.from\('system_logs'\)\.insert\(\{.*?'Teacher'\)\s*\}\);",
    r"const { error } = await supabase.from('staff_clock_ins').insert({\n       user_id: (user?.user_id || user?.id),\n       action_type: newStatus === 'clocked_in' ? 'clock_in' : 'clock_out'\n    });",
    content,
    flags=re.DOTALL
)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
print("Patched!")
