const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherAssignments.tsx', 'utf8');

code = code.replace(
  "const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';",
  "const newStatus = (currentStatus === 'completed') ? 'pending' : 'completed';"
);

fs.writeFileSync('src/pages/TeacherAssignments.tsx', code);
