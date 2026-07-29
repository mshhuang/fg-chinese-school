const fs = require('fs');
let sheetCode = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const targetPresent = `                                     <button 
                                        onClick={async () => {
                                            if (isSubmitted) return;
                                            setAttendance(p => ({...p, [s.student_id]: 'Present'}));
                                            if (clockIns[s.student_id] !== 'checked_in') {
                                                await toggleClockIn(s.student_id, clockIns[s.student_id], true);
                                            }
                                        }}`;

const replacePresent = `                                     <button 
                                        onClick={async () => {
                                            if (isSubmitted) return;
                                            const isCurrently = attendance[s.student_id] === 'Present';
                                            setAttendance(p => ({...p, [s.student_id]: isCurrently ? '' : 'Present'}));
                                            if (!isCurrently && clockIns[s.student_id] !== 'checked_in' && clockIns[s.student_id] !== 'checked_out') {
                                                await toggleClockIn(s.student_id, 'not_checked_in', true);
                                            }
                                        }}`;

const targetLate = `                                     <button 
                                        onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: 'Late'}))}`;
const replaceLate = `                                     <button 
                                        onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: p[s.student_id] === 'Late' ? '' : 'Late'}))}`;

const targetAbsent = `                                     <button 
                                        onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: 'Absent'}))}`;
const replaceAbsent = `                                     <button 
                                        onClick={() => !isSubmitted && setAttendance(p => ({...p, [s.student_id]: p[s.student_id] === 'Absent' ? '' : 'Absent'}))}`;

sheetCode = sheetCode.replace(targetPresent, replacePresent);
sheetCode = sheetCode.replace(targetLate, replaceLate);
sheetCode = sheetCode.replace(targetAbsent, replaceAbsent);

fs.writeFileSync('src/pages/AttendanceSheet.tsx', sheetCode);
console.log('done toggles');
