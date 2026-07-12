import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

target = """    const { error } = await supabase.from('staff_clock_ins').insert({
       user_id: (user?.user_id || user?.id),
       action_type: newStatus === 'clocked_in' ? 'clock_in' : 'clock_out'
    });"""

replacement = """    const { error } = await supabase.from('staff_clock_ins').insert({
       user_id: (user?.user_id || user?.id),
       action_type: newStatus === 'clocked_in' ? 'clock_in' : 'clock_out',
       daily_status: newStatus === 'clocked_in' ? 'check-in the building' : 'classes over'
    });"""

content = content.replace(target, replacement)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
print("TeacherDashboard patched!")
