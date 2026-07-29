const fs = require('fs');
let code = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const target1 = "className={`flex items-center justify-center p-2 rounded-full transition-colors ${attendance[s.student_id] === 'Present' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? 'hover:bg-surface-variant' : 'opacity-80 cursor-default'}`}";
const replace1 = "className={`flex items-center justify-center p-2 rounded-full transition-all border ${attendance[s.student_id] === 'Present' ? 'bg-green-500 border-green-600 text-white shadow-md scale-110' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? (attendance[s.student_id] === 'Present' ? 'hover:bg-green-600' : 'hover:bg-green-100 hover:text-green-600 hover:border-green-300') : 'opacity-80 cursor-default'}`}";

const target2 = "className={`flex items-center justify-center p-2 rounded-full transition-colors ${attendance[s.student_id] === 'Late' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? 'hover:bg-surface-variant' : 'opacity-80 cursor-default'}`}";
const replace2 = "className={`flex items-center justify-center p-2 rounded-full transition-all border ${attendance[s.student_id] === 'Late' ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-110' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? (attendance[s.student_id] === 'Late' ? 'hover:bg-amber-600' : 'hover:bg-amber-100 hover:text-amber-600 hover:border-amber-300') : 'opacity-80 cursor-default'}`}";

const target3 = "className={`flex items-center justify-center p-2 rounded-full transition-colors ${attendance[s.student_id] === 'Absent' ? 'bg-error text-error-container shadow-sm' : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? 'hover:bg-surface-variant' : 'opacity-80 cursor-default'}`}";
const replace3 = "className={`flex items-center justify-center p-2 rounded-full transition-all border ${attendance[s.student_id] === 'Absent' ? 'bg-red-500 border-red-600 text-white shadow-md scale-110' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'} ${!isSubmitted ? (attendance[s.student_id] === 'Absent' ? 'hover:bg-red-600' : 'hover:bg-red-100 hover:text-red-600 hover:border-red-300') : 'opacity-80 cursor-default'}`}";

code = code.replace(target1, replace1).replace(target2, replace2).replace(target3, replace3);
fs.writeFileSync('src/pages/AttendanceSheet.tsx', code);
console.log('done patching colors');
