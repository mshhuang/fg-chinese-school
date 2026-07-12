import fs from 'fs';
let content = fs.readFileSync('src/pages/StaffAttendance.tsx', 'utf-8');

const matchStr = `    const { data, error } = await supabase.from('enrollments')
      .select(\`
         student_id,
         users!enrollments_student_id_fkey (first_name, last_name, avatar_url)
      \`)
      .eq('class_id', cls.class_id);
      
    if (!error && data) {
       const mapped = data.map(d => ({
          student_id: d.student_id,
          first_name: (d.users as any)?.first_name || 'Unknown',
          last_name: (d.users as any)?.last_name || 'Student',
          avatar_url: (d.users as any)?.avatar_url
       })).sort((a, b) => a.last_name.localeCompare(b.last_name));
       setStudents(mapped);
    }`;

const newStr = `    const { data: enrollData, error } = await supabase.from('enrollments')
      .select('student_id')
      .eq('class_id', cls.class_id);
      
    if (!error && enrollData && enrollData.length > 0) {
       const studentIds = enrollData.map((e: any) => e.student_id).filter(Boolean);
       if (studentIds.length > 0) {
         const { data: usersData } = await supabase
            .from('users')
            .select('user_id, first_name, last_name, avatar_url')
            .in('user_id', studentIds);
         
         if (usersData) {
            const mapped = usersData.map(u => ({
               student_id: u.user_id,
               first_name: u.first_name || 'Unknown',
               last_name: u.last_name || 'Student',
               avatar_url: u.avatar_url
            })).sort((a, b) => a.last_name.localeCompare(b.last_name));
            setStudents(mapped);
         } else {
            setStudents([]);
         }
       } else {
         setStudents([]);
       }
    } else {
       setStudents([]);
    }`;

content = content.replace(matchStr, newStr);

content = content.replace('Room {selectedClass.room_number || "302"}', 'Room {selectedClass.room_number || "TBD"}');

fs.writeFileSync('src/pages/StaffAttendance.tsx', content);
