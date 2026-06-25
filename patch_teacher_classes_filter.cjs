const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

// Change fetchClasses to filter by teacher
code = code.replace(
  "const { data } = await supabase.from('classes').select('*').order('class_name');",
  "const uStr = localStorage.getItem('user');\n    let teacherId = '';\n    if (uStr) {\n       const u = JSON.parse(uStr);\n       teacherId = u.id;\n    }\n    const { data } = await supabase.from('classes').select('*').eq('primary_teacher_id', teacherId).order('class_name');"
);

fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
