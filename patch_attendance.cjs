const fs = require('fs');
let code = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const target1 = `  const toggleClockIn = async (studentId: string, currentStatus: 'checked_in' | 'checked_out' | 'not_checked_in' | undefined) => {`;
const replace1 = `  const toggleClockIn = async (studentId: string, currentStatus: 'checked_in' | 'checked_out' | 'not_checked_in' | undefined, skipDuplicateCheck: boolean = false) => {`;

code = code.replace(target1, replace1);

const target2 = `    if (existingDup) {`;
const replace2 = `    if (existingDup && !skipDuplicateCheck) {`;
code = code.replace(target2, replace2);

const handlePresentTarget = `                                     <button 
                                        onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: 'Present'}))}
                                        disabled={isSubmitted}`;
const handlePresentReplace = `                                     <button 
                                        onClick={async () => {
                                            if (isSubmitted) return;
                                            setAttendance(p => ({...p, [s.student_id]: 'Present'}));
                                            if (clockIns[s.student_id] !== 'checked_in') {
                                                await toggleClockIn(s.student_id, clockIns[s.student_id], true);
                                            }
                                        }}
                                        disabled={isSubmitted}`;
code = code.replace(handlePresentTarget, handlePresentReplace);

fs.writeFileSync('src/pages/AttendanceSheet.tsx', code);
console.log('Done patching attendance sheet');
