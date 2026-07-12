import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

# Add usersMap state
state_pattern = r"const \[assignedClasses, setAssignedClasses\] = useState<any\[\]>\(\[\]\);"
state_replacement = """const [assignedClasses, setAssignedClasses] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});"""
content = re.sub(state_pattern, state_replacement, content)

# Fetch all users
fetch_pattern = r"const \{ data \} = await supabase.from\('classes'\).select\('\*, programs\(program_name\), users:primary_teacher_id\(first_name, last_name\), co_teacher:co_teacher_id\(first_name, last_name\)'\);"
fetch_replacement = """const { data: userData } = await supabase.from('users').select('user_id, first_name, last_name, user_roles(roles(role_name))');
     const uMap: Record<string, any> = {};
     if (userData) {
        userData.forEach((u: any) => {
           const isVolunteer = u.user_roles?.some((ur: any) => ur.roles?.role_name === 'Volunteer');
           uMap[u.user_id] = { ...u, isVolunteer };
        });
        setUsersMap(uMap);
     }
     
     const { data } = await supabase.from('classes').select('*, programs(program_name), users:primary_teacher_id(first_name, last_name), co_teacher:co_teacher_id(first_name, last_name), co_teachers');"""
content = re.sub(fetch_pattern, fetch_replacement, content)

# Update myClasses filter
filter_pattern = r"const myClasses = data\.filter\(c => c\.primary_teacher_id === teacherId \|\| c\.co_teacher_id === teacherId\);"
filter_replacement = """const myClasses = data.filter(c => c.primary_teacher_id === teacherId || c.co_teacher_id === teacherId || (c.co_teachers || []).includes(teacherId));"""
content = re.sub(filter_pattern, filter_replacement, content)


# Update the display logic
display_pattern = r"\{cls\.co_teacher_id === \(user\?\.user_id \|\| user\?\.id\).*?\n.*?\}</span"
display_replacement = """{(() => {
                                 const currentUserId = user?.user_id || user?.id;
                                 const allCoTeachers = [
                                    ...(cls.co_teacher_id && !(cls.co_teachers || []).includes(cls.co_teacher_id) ? [cls.co_teacher_id] : []),
                                    ...(cls.co_teachers || [])
                                 ];
                                 if (allCoTeachers.length === 0) return 'TBD';
                                 
                                 return allCoTeachers.map(id => {
                                    if (id === currentUserId) return `You (${formatTeacherName(user?.first_name, user?.last_name, 'Teacher')})`;
                                    const u = usersMap[id];
                                    if (!u) return 'Unknown';
                                    if (u.isVolunteer) return `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Volunteer';
                                    return formatTeacherName(u.first_name, u.last_name, 'Teacher');
                                 }).join(', ');
                               })()}
                              </span"""
content = re.sub(display_pattern, display_replacement, content, flags=re.DOTALL)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
