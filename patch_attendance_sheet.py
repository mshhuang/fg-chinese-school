import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

# Update state
content = content.replace(
    'const [clockIns, setClockIns] = useState<Record<string, boolean>>({});',
    "const [clockIns, setClockIns] = useState<Record<string, 'checked_in' | 'checked_out' | 'not_checked_in'>>({});"
)

# Update fetch mapping
fetch_replacement = """       if (clockInData) {
          const cMap: Record<string, 'checked_in' | 'checked_out' | 'not_checked_in'> = {};
          clockInData.forEach(r => {
             if (cMap[r.student_id] === undefined) {
                cMap[r.student_id] = r.action_type === 'school_check_in' ? 'checked_in' : 'checked_out';
             }
          });
          setClockIns(cMap);"""
content = re.sub(
    r'if \(clockInData\) \{.*?setClockIns\(cMap\);',
    fetch_replacement,
    content,
    flags=re.DOTALL
)

# Update toggle
toggle_replacement = """  const toggleClockIn = async (studentId: string, currentStatus: 'checked_in' | 'checked_out' | 'not_checked_in' | undefined) => {
     const isCheckedIn = currentStatus === 'checked_in';
     const actionType = isCheckedIn ? 'school_check_out' : 'school_check_in';
     const dailyStatus = isCheckedIn ? 'classes over' : 'check-in the building';
     
     // Optimistic update
     setClockIns(prev => ({ ...prev, [studentId]: isCheckedIn ? 'checked_out' : 'checked_in' }));"""
content = re.sub(
    r'const toggleClockIn = async \(studentId: string, isCurrentlyClockedIn: boolean\) => \{.*?setClockIns\(prev => \(\{ \.\.\.prev, \[studentId\]: !isCurrentlyClockedIn \}\)\);',
    toggle_replacement,
    content,
    flags=re.DOTALL
)

# Update UI render
ui_replacement = """                                     <button
                                        onClick={() => toggleClockIn(s.student_id, clockIns[s.student_id])}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${clockIns[s.student_id] === 'checked_in' ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' : clockIns[s.student_id] === 'checked_out' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#E65100]/30' : 'bg-surface-variant text-on-surface-variant border border-outline-variant/30'}`}
                                     >
                                        {clockIns[s.student_id] === 'checked_in' ? 'Clock Out' : 'Clock In'}
                                     </button>
                                     <span className={`text-[11px] font-label ${clockIns[s.student_id] === 'checked_in' ? 'text-[#2E7D32]' : clockIns[s.student_id] === 'checked_out' ? 'text-[#E65100]' : 'text-on-surface-variant'}`}>
                                        {clockIns[s.student_id] === 'checked_in' ? `${s.first_name} is in the school` : clockIns[s.student_id] === 'checked_out' ? `${s.first_name} is ready to go home` : 'Not Arrived'}
                                     </span>"""
content = re.sub(
    r'<button\s+onClick=\{\(\) => toggleClockIn\(s\.student_id, !!clockIns\[s\.student_id\]\)\}\s+className=\{`px-4 py-1\.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors \$\{clockIns\[s\.student_id\] \? \'bg-\[#E8F5E9\] text-\[#2E7D32\] border border-\[#2E7D32\]/30\' : \'bg-\[#FFF3E0\] text-\[#E65100\] border border-\[#E65100\]/30\'\}`\}\s*>\s*\{clockIns\[s\.student_id\] \? \'Clock Out\' : \'Clock In\'\}\s*</button>\s*<span className=\{`text-\[11px\] font-label \$\{clockIns\[s\.student_id\] \? \'text-\[#2E7D32\]\' : \'text-\[#E65100\]\'\}`\}>\s*\{clockIns\[s\.student_id\] \? `\$\{s\.first_name\} is in the school` : `\$\{s\.first_name\} is ready to go home`\}\s*</span>',
    ui_replacement,
    content,
    flags=re.DOTALL
)

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
