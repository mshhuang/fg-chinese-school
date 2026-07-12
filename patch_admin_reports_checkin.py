import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

target_fetch = """  async function fetchCheckinLogs() {
     setCheckinLogsLoading(true);
     const startOfDay = new Date(checkinDate);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(checkinDate);
     endOfDay.setHours(23, 59, 59, 999);
     
     const { data, error } = await supabase
       .from('system_logs')
       .select('*')
       .in('action_type', ['teacher_clock_in', 'teacher_clock_out', 'school_check_in', 'school_check_out'])
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });"""

replacement_fetch = """  async function fetchCheckinLogs() {
     setCheckinLogsLoading(true);
     const startOfDay = new Date(checkinDate);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(checkinDate);
     endOfDay.setHours(23, 59, 59, 999);
     
     const { data, error } = await supabase
       .from('student_clock_ins')
       .select('*, users!student_id(first_name, last_name, email)')
       .gte('created_at', startOfDay.toISOString())
       .lte('created_at', endOfDay.toISOString())
       .order('created_at', { ascending: false });"""

content = content.replace(target_fetch, replacement_fetch)

# Update the UI rendering for checkin_history
target_ui = """                         {checkinLogs.map(log => (
                           <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.user_name || 'Unknown'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type.includes('in') ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace(/_/g, ' ')}
                                </span>
                             </td>
                           </tr>
                         ))}"""

replacement_ui = """                         {checkinLogs.map(log => (
                           <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.users ? `${log.users.first_name} ${log.users.last_name}` : 'Unknown'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type.includes('in') ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace(/_/g, ' ')}
                                </span>
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-surface-variant text-on-surface-variant">
                                   {log.daily_status}
                                </span>
                             </td>
                           </tr>
                         ))}"""

content = content.replace(target_ui, replacement_ui)

# Add Daily Status column header
target_header = """                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">User Name</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>"""

replacement_header = """                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Student Name</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Daily Status</th>"""

content = content.replace(target_header, replacement_header)

target_title = """<h2 className="font-display text-2xl font-bold text-on-surface">Check-in History</h2>"""
replacement_title = """<h2 className="font-display text-2xl font-bold text-on-surface">Student Check-in History</h2>"""
content = content.replace(target_title, replacement_title)

# Let's also add the daily_status field to staff_clock_ins tab in AdminReports
target_staff_header = """                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Staff Name</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                         </tr>"""

replacement_staff_header = """                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Staff Name</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action</th>
                           <th className="py-3 px-4 font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">Daily Status</th>
                         </tr>"""

content = content.replace(target_staff_header, replacement_staff_header)

target_staff_ui = """                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type === 'clock_in' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace('_', ' ')}
                                </span>
                             </td>
                           </tr>"""

replacement_staff_ui = """                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type === 'clock_in' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace('_', ' ')}
                                </span>
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-surface-variant text-on-surface-variant">
                                   {log.daily_status || 'not arrive yet'}
                                </span>
                             </td>
                           </tr>"""

content = content.replace(target_staff_ui, replacement_staff_ui)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("AdminReports patched for student_clock_ins!")
