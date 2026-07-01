const fs = require('fs');
let code = fs.readFileSync('src/pages/Announcements.tsx', 'utf8');

const targetStr = `                                {audienceMode === 'users' && (
                                    <div className="flex flex-col gap-2">
                                        {availableUsers.map(u => (
                                             <label key={u.user_id} className="flex items-center gap-2 cursor-pointer text-on-surface border-b border-outline-variant/10 pb-2">
                                                <input 
                                                   type="checkbox" 
                                                   className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                   checked={targetUserIds.includes(u.user_id)}
                                                   onChange={() => toggleMultiSelect(setTargetUserIds, u.user_id)}
                                                />
                                                <span className="font-bold">{u.first_name} {u.last_name}</span> 
                                                <span className="text-xs text-on-surface-variant">({u.email})</span>
                                            </label>
                                        ))}
                                    </div>
                                )}`;

const replaceStr = `                                {audienceMode === 'users' && (
                                    <div className="flex flex-col">
                                        {(() => {
                                          const rolesList = new Set();
                                          availableUsers.forEach(u => {
                                            (u.role_names || []).forEach((r) => rolesList.add(r));
                                          });
                                          const desiredOrder = ['Admin', 'Teacher', 'Student', 'Volunteer', 'Staff', 'Builder'];
                                          const sortedRoles = Array.from(rolesList).sort((a, b) => {
                                            const idxA = desiredOrder.indexOf(a);
                                            const idxB = desiredOrder.indexOf(b);
                                            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                            if (idxA !== -1) return -1;
                                            if (idxB !== -1) return 1;
                                            return a.localeCompare(b);
                                          });
                                          const finalRoles = [...sortedRoles, "Others"];
                                          
                                          return finalRoles.map(r => {
                                              const group = availableUsers.filter(u => {
                                                const userRoles = u.role_names || [];
                                                if (r === "Others") return userRoles.length === 0;
                                                return userRoles.includes(r);
                                              });
                                              
                                              if (group.length === 0) return null;
                                              
                                              group.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
                                              
                                              const roleLabel = r === "Others" ? "Unassigned" : (r === "Admin" ? "School Admin" : (r === "Teacher" ? "Teachers" : (r === "Student" ? "Students" : r)));

                                              return (
                                                 <div key={r} className="mb-4 last:mb-0">
                                                     <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 bg-surface-variant/30 px-2 py-1 rounded">
                                                         {roleLabel}
                                                     </div>
                                                     <div className="flex flex-col gap-2 pl-2">
                                                         {group.map(u => (
                                                              <label key={u.user_id} className="flex items-center gap-2 cursor-pointer text-on-surface border-b border-outline-variant/10 pb-2 last:border-0 last:pb-0">
                                                                 <input 
                                                                    type="checkbox" 
                                                                    className="rounded border-outline-variant/50 text-primary focus:ring-primary"
                                                                    checked={targetUserIds.includes(u.user_id)}
                                                                    onChange={() => toggleMultiSelect(setTargetUserIds, u.user_id)}
                                                                 />
                                                                 <span className="font-bold">{u.first_name} {u.last_name}</span> 
                                                                 <span className="text-xs text-on-surface-variant">({u.email})</span>
                                                             </label>
                                                         ))}
                                                     </div>
                                                 </div>
                                              );
                                          });
                                        })()}
                                    </div>
                                )}`;

if (!code.includes(targetStr)) {
  console.log("Target not found!");
} else {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/pages/Announcements.tsx', code);
  console.log("Patched successfully");
}
