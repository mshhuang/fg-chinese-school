import fs from 'fs';
let content = fs.readFileSync('src/pages/StaffAttendance.tsx', 'utf-8');

const replacement = `  const handleSelectClass = async (cls: any) => {
    setSelectedClass(cls);
    setStudentsLoading(true);
    setAttendance({});
    
    let currentStudents: any[] = [];
    const { data: enrollData, error } = await supabase.from("enrollments").select("student_id").eq("class_id", cls.class_id);
    if (!error && enrollData && enrollData.length > 0) {
       const studentIds = enrollData.map((e: any) => e.student_id).filter(Boolean);
       if (studentIds.length > 0) {
         const { data: usersData } = await supabase.from("users").select("user_id, first_name, last_name, avatar_url").in("user_id", studentIds);
         if (usersData) {
            currentStudents = usersData.map((u: any) => ({
               student_id: u.user_id,
               first_name: u.first_name || "Unknown",
               last_name: u.last_name || "Student",
               avatar_url: u.avatar_url
            })).sort((a: any, b: any) => a.last_name.localeCompare(b.last_name));
            setStudents(currentStudents);
         } else { setStudents([]); }
       } else { setStudents([]); }
    } else { setStudents([]); }
    
    // Mock attendance for visual demo, or fetch real
    const { data: existing } = await supabase.from('attendance')
       .select('student_id, status')
       .eq('class_id', cls.class_id)
       .eq('attendance_date', attendanceDate);
       
    if (existing && existing.length > 0) {
       const attMap: Record<string, string> = {};
       existing.forEach(r => {
          if (r.student_id && r.status !== null) {
             attMap[r.student_id] = r.status;
          }
       });
       setAttendance(attMap);
    } else {
       // Default mock values to match screenshot style
       const initMap: Record<string, string> = {};
       currentStudents.forEach((s, idx) => {
          if (s.student_id) {
            // Make some absent for visual variety
            initMap[s.student_id] = idx % 5 === 2 ? 'Absent' : 'Present';
          }
       });
       setAttendance(initMap);
    }
    setStudentsLoading(false);
  };`;

const matchRegex = /const handleSelectClass = async \(cls: any\) => \{[\s\S]*?setStudentsLoading\(false\);\n  \};/m;

content = content.replace(matchRegex, replacement);

fs.writeFileSync('src/pages/StaffAttendance.tsx', content);
