const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');
code = code.replace("CheckCircle2, Circle, Users", "CheckCircle2, Circle, Users, XCircle");
fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
