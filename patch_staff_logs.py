import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

replacement = """    let currentStudents: any[] = [];
    const { data: enrollData, error } = await supabase.from("enrollments").select("student_id").eq("class_id", cls.class_id);
    console.log("DEBUG StaffAttendance enrollments fetch:", enrollData, error, cls.class_id);
    if (!error && enrollData && enrollData.length > 0) {
       const studentIds = enrollData.map((e: any) => e.student_id).filter(Boolean);
       console.log("DEBUG studentIds:", studentIds);
       if (studentIds.length > 0) {
         const { data: usersData } = await supabase.from("users").select("user_id, first_name, last_name, avatar_url").in("user_id", studentIds);
         console.log("DEBUG usersData:", usersData);
"""

content = content.replace("""    let currentStudents: any[] = [];
    const { data: enrollData, error } = await supabase.from("enrollments").select("student_id").eq("class_id", cls.class_id);
    if (!error && enrollData && enrollData.length > 0) {
       const studentIds = enrollData.map((e: any) => e.student_id).filter(Boolean);
       if (studentIds.length > 0) {
         const { data: usersData } = await supabase.from("users").select("user_id, first_name, last_name, avatar_url").in("user_id", studentIds);""", replacement)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
