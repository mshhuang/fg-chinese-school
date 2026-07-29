const fs = require('fs');
let code = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const target = `                                           : clockIns[s.student_id] === 'checked_out' ? \`\${s.first_name} is ready to go home\` : 'Not Arrived'}`;
const replace = `                                           : clockIns[s.student_id] === 'checked_out' ? (() => {
                                                if (!clockInTimes[s.student_id]) return \`\${s.first_name} is ready to go home\`;
                                                const d = new Date(clockInTimes[s.student_id]);
                                                const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'});
                                                const dateStr = \`\${(d.getMonth() + 1)}/\${d.getDate()}/\${d.getFullYear()}\`;
                                                return \`\${s.first_name} is ready to go home。\${timeStr} on \${dateStr}\`;
                                             })() : 'Not Arrived'}`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/AttendanceSheet.tsx', code);
console.log('done fixing attendance sheet');
