import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

target_ui = """                         {checkinLogs.map(log => (
                           <tr key={log.log_id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.user_name || 'Unknown User'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                {log.action_type.replace('school_', '').replace(/_/g, ' ')}
                                {log.data_changed?.manual_override && <span className="ml-2 text-xs text-primary">(Manual)</span>}
                             </td>
                           </tr>
                         ))}"""

replacement_ui = """                         {checkinLogs.map(log => (
                           <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </td>
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">
                                {log.users ? `${log.users.first_name} ${log.users.last_name}` : 'Unknown Student'}
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type.includes('in') ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                                   {log.action_type.replace('school_', '').replace(/_/g, ' ')}
                                </span>
                             </td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant capitalize">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-surface-variant text-on-surface-variant">
                                   {log.daily_status || 'not arrive yet'}
                                </span>
                             </td>
                           </tr>
                         ))}"""

content = content.replace(target_ui, replacement_ui)

target_header = """                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">User</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Action</th>"""

replacement_header = """                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Time</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Student</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Action</th>
                           <th className="py-3 px-4 font-label font-bold text-on-surface-variant">Daily Status</th>"""

content = content.replace(target_header, replacement_header)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("AdminReports patched for checkinLogs!")
