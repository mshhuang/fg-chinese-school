import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

# For Class Students
pattern_students_th = r"""(<th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>)\s*<th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password Status</th>"""
replacement_students_th = r"""\1
                            <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>"""
                            
content = re.sub(pattern_students_th, replacement_students_th, content, count=1)

pattern_students_td = r"""(<td className="py-3 px-4 font-body text-sm text-on-surface-variant">\{user\.user_name \|\| '-'}</td>)\s*<td className="py-3 px-4 font-body text-sm text-on-surface-variant">\s*\{user\.password_hash \? 'Set \(Encrypted\)' : 'Not Set'\}\s*</td>"""
replacement_students_td = r"""\1
                              <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                              <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>"""

content = re.sub(pattern_students_td, replacement_students_td, content, count=1)

# For Staff
pattern_staff_th = r"""(<th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Role</th>)\s*<th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password Status</th>"""
replacement_staff_th = r"""\1
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>"""

content = re.sub(pattern_staff_th, replacement_staff_th, content, count=1)

pattern_staff_td = r"""(<td className="py-3 px-4 font-body text-sm text-on-surface-variant">\{role\}</td>)\s*<td className="py-3 px-4 font-body text-sm text-on-surface-variant">\s*\{user\.password_hash \? 'Set \(Encrypted\)' : 'Not Set'\}\s*</td>"""
replacement_staff_td = r"""\1
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>"""

content = re.sub(pattern_staff_td, replacement_staff_td, content, count=1)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)

print("Replaced!")
