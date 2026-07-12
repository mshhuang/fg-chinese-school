import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

# First, insert the state variable
if 'const [coTeachersMap, setCoTeachersMap]' not in content:
    content = content.replace(
        'const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString(\'en-CA\'));',
        'const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString(\'en-CA\'));\n  const [coTeachersMap, setCoTeachersMap] = useState<Record<string, any>>({});'
    )

# Then inject the fetch logic after setClasses(data)
if 'const coTeacherIds = new Set<string>();' not in content:
    content = content.replace(
        'setClasses(data);',
        '''setClasses(data);
            // Fetch users for co_teachers array
            const coTeacherIds = new Set<string>();
            data.forEach((c: any) => {
               if (c.co_teachers) {
                   c.co_teachers.forEach((id: string) => coTeacherIds.add(id));
               }
            });
            if (coTeacherIds.size > 0) {
               supabase.from('users').select('user_id, first_name, last_name').in('user_id', Array.from(coTeacherIds)).then(({data: usersData}) => {
                   if (usersData) {
                      const map: Record<string, any> = {};
                      usersData.forEach((u: any) => map[u.user_id] = u);
                      setCoTeachersMap(map);
                   }
               });
            }'''
    )

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
