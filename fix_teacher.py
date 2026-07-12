with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

target = """    await supabase.from('system_logs').insert({
       user_id: (user?.user_id || user?.id),
       action_type: newStatus === 'clocked_in' ? 'teacher_clock_in' : 'teacher_clock_out',
       details: { time: new Date().toISOString() },
       user_name: formatTeacherName(user.first_name, user.last_name, 'Teacher')
    });"""

replacement = """    const { error } = await supabase.from('system_logs').insert({
       user_id: (user?.user_id || user?.id),
       action_type: newStatus === 'clocked_in' ? 'teacher_clock_in' : 'teacher_clock_out',
       details: { time: new Date().toISOString() },
       user_name: formatTeacherName(user.first_name, user.last_name, 'Teacher')
    });
    if (error) console.error("Error clocking in:", error);"""

content = content.replace(target, replacement)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
