import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

# 1. Add state for staff_attendance
content = re.sub(
    r"useState<'teachers' \| 'students' \| 'classes' \| 'enrollments' \| 'attendance' \| 'credentials' \| 'login_history' \| 'checkin_history'>",
    r"useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'attendance' | 'credentials' | 'login_history' | 'checkin_history' | 'staff_attendance'>",
    content
)

# 2. Add state for staffAttendanceDate and logs
content = re.sub(
    r"const \[checkinLogs, setCheckinLogs\] = useState<any\[\]>\(\[\]\);",
    r"const [checkinLogs, setCheckinLogs] = useState<any[]>([]);\n  const [staffClockLogs, setStaffClockLogs] = useState<any[]>([]);\n  const [staffAttendanceDate, setStaffAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));\n  const [staffClockLogsLoading, setStaffClockLogsLoading] = useState(false);",
    content
)

# 3. Add useEffect and fetch method
fetch_code = """
  useEffect(() => {
    if (activeTab === 'staff_attendance') {
       fetchStaffClockLogs();
    }
  }, [activeTab, staffAttendanceDate]);

  async function fetchStaffClockLogs() {
     setStaffClockLogsLoading(true);
     const startOfDay = new Date(staffAttendanceDate);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(staffAttendanceDate);
     endOfDay.setHours(23, 59, 59, 999);
     
     const { data, error } = await supabase
       .from('staff_clock_ins')
       .select('*, users(first_name, last_name, email)')
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });
       
     if (data) {
       setStaffClockLogs(data);
     } else if (error) {
       console.error("Staff clock logs fetch error:", error);
     }
     setStaffClockLogsLoading(false);
  }
"""

content = re.sub(
    r"async function fetchCheckinLogs\(\) \{",
    fetch_code.strip() + "\n\n  async function fetchCheckinLogs() {",
    content
)

# 4. Add the button to the UI
button_code = """
        <button
          onClick={() => setActiveTab('staff_attendance')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all ${
            activeTab === 'staff_attendance' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Clock className="w-4 h-4" /> Staff Attendance
        </button>"""

content = re.sub(
    r"(<button\s+onClick=\{\(\) => setActiveTab\('login_history'\)\}.*?</button>)",
    button_code.strip() + "\n        \\1",
    content,
    flags=re.DOTALL
)

# 5. Render the UI for staff_attendance
ui_code = """
            {activeTab === 'staff_attendance' && (
              <div>
                <ReportPrintHeader title={`Staff Attendance Report - ${staffAttendanceDate}`} />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Staff Attendance Report</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{staffAttendanceDate}</span>
                   </div>
                   <p className="text-on-surface-variant">A report tracking staff clock-ins and clock-outs.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Date</label>
                     <input
                        type="date"
                        value={staffAttendanceDate}
                       onChange={e => setStaffAttendanceDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                </div>

                {staffClockLogsLoading ? (
                   <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                   <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                     <table className="w-full text-left border-collapse">
                       <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                         <tr>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Staff Name</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-outline-variant/20">
                         {staffClockLogs.map(log => (
                           <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.users ? formatTeacherName(log.users.first_name, log.users.last_name, 'Teacher') : 'Unknown Staff'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type === 'clock_in' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace('_', ' ')}
                                </span>
                             </td>
                           </tr>
                         ))}
                         {staffClockLogs.length === 0 && (
                           <tr>
                             <td colSpan={3} className="py-6 text-center text-on-surface-variant">No staff attendance records found for this date.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                )}
              </div>
            )}
"""

content = re.sub(
    r"(\{activeTab === 'login_history' && \()",
    ui_code.strip() + "\n\n            \\1",
    content
)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)

print("Admin reports patched!")
