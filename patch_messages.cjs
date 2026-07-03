const fs = require('fs');
let code = fs.readFileSync('src/components/InternalMessagesPanel.tsx', 'utf8');

const regex = /\{(\(\) => \{[\s\S]*?finalRoles\.map\(r => \{[\s\S]*?\}\)[\s\S]*?\})\(\)\}/;

const replacement = `{(() => {
                      const desiredOrder = ['Admin', 'Teacher', 'Student', 'Parent', 'Volunteer', 'Staff', 'Builder'];
                      
                      const getPrimaryRole = (roles) => {
                          if (!roles || roles.length === 0) return 'Others';
                          let bestIdx = 999;
                          let bestRole = 'Others';
                          for (const r of roles) {
                              const idx = desiredOrder.indexOf(r);
                              if (idx !== -1 && idx < bestIdx) {
                                  bestIdx = idx;
                                  bestRole = r;
                              }
                          }
                          if (bestIdx === 999) return roles[0];
                          return bestRole;
                      };

                      const groupedUsers = {};
                      allowedUsers.forEach(u => {
                          const primary = getPrimaryRole(u.role_names);
                          if (!groupedUsers[primary]) groupedUsers[primary] = [];
                          groupedUsers[primary].push(u);
                      });

                      const sortedRoles = Object.keys(groupedUsers).sort((a, b) => {
                          const idxA = desiredOrder.indexOf(a);
                          const idxB = desiredOrder.indexOf(b);
                          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                          if (idxA !== -1) return -1;
                          if (idxB !== -1) return 1;
                          return a.localeCompare(b);
                      });

                      return sortedRoles.map(r => {
                          const group = groupedUsers[r];
                          if (!group || group.length === 0) return null;
                          
                          group.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
                          
                          return (
                            <optgroup key={r} label={r === "Others" ? "Unassigned" : (r === "Admin" ? "School Admin" : (r === "Teacher" ? "Teachers" : (r === "Student" ? "Students" : (r === "Parent" ? "Parents" : r))))}>
                                {group.map(u => {
                                  const isTeacher = u.role_names?.includes('Teacher');
                                  const displayName = isTeacher ? formatTeacherName(u.first_name, u.last_name) : \`\${u.first_name || ''} \${u.last_name || ''}\`.trim() || 'Unknown';
                                  return (
                                    <option key={u.user_id} value={u.user_id}>
                                        {displayName}
                                    </option>
                                  );
                                })}
                            </optgroup>
                          );
                      });
                    })()}`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/InternalMessagesPanel.tsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Regex did not match!");
}
