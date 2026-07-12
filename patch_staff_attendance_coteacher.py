import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

# I need to add fetching of co_teachers names.
# Alternatively, I can just fetch all users whose role is Teacher or Volunteer.

replacement = """  const [coTeachersMap, setCoTeachersMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const init = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          
          let query = supabase.from('classes').select('*, users:primary_teacher_id(first_name, last_name), co_teacher:co_teacher_id(first_name, last_name)').order('class_name');
          
          const { data: roles } = await supabase.from('user_roles')
            .select('roles(role_name)')
            .eq('user_id', parsedUser.id);
            
          const isTeacher = roles?.some((r: any) => r.roles?.role_name === 'Teacher');
          if (isTeacher) {
             query = query.or(`primary_teacher_id.eq.${parsedUser.id},co_teacher_id.eq.${parsedUser.id},co_teachers.cs.{${parsedUser.id}}`);
          }
          
          const { data, error } = await query;
          if (!error && data) {
            setClasses(data);
            if (data.length > 0 && !stateClass) {
              handleSelectClass(data[0]);
            }
            
            // Fetch users for co_teachers array
            const coTeacherIds = new Set<string>();
            data.forEach((c: any) => {
               if (c.co_teachers) {
                   c.co_teachers.forEach((id: string) => coTeacherIds.add(id));
               }
            });
            if (coTeacherIds.size > 0) {
               const { data: usersData } = await supabase.from('users').select('user_id, first_name, last_name').in('user_id', Array.from(coTeacherIds));
               if (usersData) {
                  const map: Record<string, any> = {};
                  usersData.forEach((u: any) => map[u.user_id] = u);
                  setCoTeachersMap(map);
               }
            }
          }
        } catch (e) {}
      }
    };
"""

content = re.sub(
    r'  useEffect\(\(\) => \{\n    const init = async \(\) => \{\n      const userStr = localStorage.getItem\("user"\);\n      if \(userStr\) \{\n        try \{\n          const parsedUser = JSON.parse\(userStr\);\n          \n          let query = supabase\.from\(\'classes\'\)\.select\(\'\*, users:primary_teacher_id\(first_name, last_name\), co_teacher:co_teacher_id\(first_name, last_name\)\'\)\.order\(\'class_name\'\);\n          \n          const \{ data: roles \} = await supabase\.from\(\'user_roles\'\)\n            \.select\(\'roles\(role_name\)\'\)\n            \.eq\(\'user_id\', parsedUser\.id\);\n            \n          const isTeacher = roles\?\.some\(\(r: any\) => r\.roles\?\.role_name === \'Teacher\'\);\n          if \(isTeacher\) \{\n             // Fetch classes where user is primary teacher, legacy co-teacher, or in the co_teachers array\n             query = query\.or\(`primary_teacher_id\.eq\.\$\{parsedUser\.id\},co_teacher_id\.eq\.\$\{parsedUser\.id\},co_teachers\.cs\.\{\$\{parsedUser\.id\}\}`\);\n          \}\n          \n          const \{ data, error \} = await query;\n          if \(\!error && data\) \{\n            setClasses\(data\);\n            if \(data\.length > 0 && \!stateClass\) \{\n              handleSelectClass\(data\[0\]\);\n            \}\n          \}\n        \} catch \(e\) \{\}\n      \}\n    \};\n',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
