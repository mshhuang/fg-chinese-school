const fs = require('fs');
let code = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const target = `                                      <button
                                        onClick={() => toggleClockIn(s.student_id, clockIns[s.student_id])}
                                        className={\`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors \${clockIns[s.student_id] === 'checked_in' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' : clockIns[s.student_id] === 'checked_out' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#E65100]/30' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30'}\`}
                                     >
                                        {clockIns[s.student_id] === 'checked_in' ? 'Ready to Go Home' : 'Clock In'}
                                     </button>`;

const replace = `                                     <div className="flex gap-2">
                                        <button
                                           onClick={() => toggleClockIn(s.student_id, 'not_checked_in')}
                                           className={\`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors \${(clockIns[s.student_id] === 'checked_in' || clockIns[s.student_id] === 'checked_out') ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant/80'}\`}
                                        >
                                           Clock In
                                        </button>
                                        <button
                                           onClick={() => toggleClockIn(s.student_id, 'checked_in')}
                                           className={\`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors \${clockIns[s.student_id] === 'checked_out' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#E65100]/30' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant/80'}\`}
                                        >
                                           Ready to Go Home
                                        </button>
                                     </div>`;

if(code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('src/pages/AttendanceSheet.tsx', code);
    console.log('done');
} else {
    console.log('not found, using regex');
    const regex = /<button[\s\S]*?onClick=\{\(\) => toggleClockIn\(s\.student_id, clockIns\[s\.student_id\]\)\}[\s\S]*?<\/button>/;
    code = code.replace(regex, replace);
    fs.writeFileSync('src/pages/AttendanceSheet.tsx', code);
    console.log('done with regex');
}
