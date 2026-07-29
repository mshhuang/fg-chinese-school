const fs = require('fs');

// Patch DuplicateClockWarningModal
let modalCode = fs.readFileSync('src/components/DuplicateClockWarningModal.tsx', 'utf8');

if (!modalCode.includes('import { AlertTriangle, Clock, Save, Plus, X, Loader2, Trash2 } from')) {
    modalCode = modalCode.replace(
        `import { AlertTriangle, Clock, Save, Plus, X, Loader2 } from 'lucide-react';`,
        `import { AlertTriangle, Clock, Save, Plus, X, Loader2, Trash2 } from 'lucide-react';`
    );
}

if (!modalCode.includes('onDelete?: () => Promise<void>;')) {
    modalCode = modalCode.replace(
        `  onCreateNew?: (newTimeIso: string, newReason?: string) => Promise<void>;`,
        `  onCreateNew?: (newTimeIso: string, newReason?: string) => Promise<void>;\n  onDelete?: () => Promise<void>;`
    );
}

if (!modalCode.includes('onDelete,')) {
    modalCode = modalCode.replace(
        `  onCreateNew\n})`,
        `  onCreateNew,\n  onDelete\n})`
    );
}

const deleteButtonHTML = `
          {onDelete && (
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await onDelete();
                  onClose();
                } catch (e) {
                  console.error(e);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-2xl border border-error/30 text-error font-semibold text-sm hover:bg-error/10 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remove This Entry (Undo)
            </button>
          )}
          <button
            onClick={onClose}`;

modalCode = modalCode.replace(
    `          <button
            onClick={onClose}`,
    deleteButtonHTML
);
fs.writeFileSync('src/components/DuplicateClockWarningModal.tsx', modalCode);

// Patch AttendanceSheet.tsx
let sheetCode = fs.readFileSync('src/pages/AttendanceSheet.tsx', 'utf8');

const defaultTarget = `          // default all present
          const initMap: Record<string, string> = {};
          mapped.forEach(s => {
             if (s.student_id) initMap[s.student_id] = 'Present';
          });
          setAttendance(initMap);
          setIsSubmitted(false);`;

const defaultReplace = `          // default no color
          const initMap: Record<string, string> = {};
          setAttendance(initMap);
          setIsSubmitted(false);`;
sheetCode = sheetCode.replace(defaultTarget, defaultReplace);

const warningTarget = `        onCreateNew: async (timeIso, reason) => {
          await supabase.from('student_clock_ins').insert({
            student_id: studentId,
            action_type: actionType,
            daily_status: reason || dailyStatus,
            created_at: timeIso
          });
          setClockIns(prev => ({ ...prev, [studentId]: isCheckedIn ? 'checked_out' : 'checked_in' }));
          setClockInTimes(prev => ({ ...prev, [studentId]: timeIso }));
        }
      });`;

const warningReplace = `        onCreateNew: async (timeIso, reason) => {
          await supabase.from('student_clock_ins').insert({
            student_id: studentId,
            action_type: actionType,
            daily_status: reason || dailyStatus,
            created_at: timeIso
          });
          setClockIns(prev => ({ ...prev, [studentId]: isCheckedIn ? 'checked_out' : 'checked_in' }));
          setClockInTimes(prev => ({ ...prev, [studentId]: timeIso }));
        },
        onDelete: async () => {
           if (existingDup.id) {
               await supabase.from('student_clock_ins').delete().eq('id', existingDup.id);
           } else {
               await supabase.from('student_clock_ins').delete().eq('student_id', studentId).eq('action_type', actionType).eq('created_at', existingDup.created_at);
           }
           setClockIns(prev => ({ ...prev, [studentId]: isCheckedIn ? 'checked_in' : 'not_checked_in' }));
        }
      });`;
sheetCode = sheetCode.replace(warningTarget, warningReplace);


const buttonsTarget = `                                     <div className="flex gap-2">
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

const buttonsReplace = `                                     <div className="flex gap-2">
                                        <button
                                           onClick={() => toggleClockIn(s.student_id, 'not_checked_in')}
                                           className={\`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border \${clockIns[s.student_id] === 'checked_in' ? 'bg-green-500 border-green-600 text-white shadow-md scale-105' : 'bg-surface-variant border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/80'}\`}
                                        >
                                           Clock In
                                        </button>
                                        <button
                                           onClick={() => toggleClockIn(s.student_id, 'checked_in')}
                                           className={\`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border \${clockIns[s.student_id] === 'checked_out' ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-105' : 'bg-surface-variant border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/80'}\`}
                                        >
                                           Ready to Go Home
                                        </button>
                                     </div>`;
sheetCode = sheetCode.replace(buttonsTarget, buttonsReplace);

fs.writeFileSync('src/pages/AttendanceSheet.tsx', sheetCode);

console.log('done patching!');
