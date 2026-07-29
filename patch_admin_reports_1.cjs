const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');

code = code.replace(
  `useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'attendance' | 'credentials' | 'login_history' | 'checkin_history' | 'staff_attendance'>`,
  `useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'attendance' | 'credentials' | 'login_history' | 'student_logins' | 'checkin_history' | 'staff_attendance'>`
);

fs.writeFileSync('src/pages/AdminReports.tsx', code);
console.log("Patched tab type");
