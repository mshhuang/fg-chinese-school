const fs = require('fs');
let code = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const target = `{clockIns[s.student_id] === 'checked_in' ? 'Clock Out' : 'Clock In'}`;
const replace = `{clockIns[s.student_id] === 'checked_in' ? 'Ready to Go Home' : 'Clock In'}`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/AttendanceSheet.tsx', code);
console.log('done');
