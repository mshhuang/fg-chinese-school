import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

replacement_th = """                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Name</th>
                           <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider w-64 text-center">Building Status</th>"""

content = content.replace(
    '<th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Name</th>',
    replacement_th
)

replacement_td = """                               <td className="py-3 px-4">
                                  <span className="font-body text-sm font-bold text-on-surface">{s.first_name} {s.last_name}</span>
                               </td>
                               <td className="py-3 px-4 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                     <button
                                        onClick={() => toggleClockIn(s.student_id, !!clockIns[s.student_id])}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${clockIns[s.student_id] ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-[#EFEBE9] text-[#5D4037] border border-[#5D4037]/30'}`}
                                     >
                                        {clockIns[s.student_id] ? 'Clock Out' : 'Clock In'}
                                     </button>
                                     <span className={`text-[11px] font-label ${clockIns[s.student_id] ? 'text-[#2E7D32]' : 'text-[#5D4037]'}`}>
                                        {clockIns[s.student_id] ? `${s.first_name} is in the school` : `${s.first_name} is ready to go home`}
                                     </span>
                                  </div>
                               </td>"""

content = content.replace(
    """                               <td className="py-3 px-4">
                                  <span className="font-body text-sm font-bold text-on-surface">{s.first_name} {s.last_name}</span>
                               </td>""",
    replacement_td
)


with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
