const fs = require('fs');
let code = fs.readFileSync('src/components/InternalMessagesPanel.tsx', 'utf8');

const targetStr = `                      const sortedRoles = Array.from(rolesList).sort();
                      const finalRoles = [...sortedRoles, "Others"];`;

const replaceStr = `                      const desiredOrder = ['Admin', 'Teacher', 'Student', 'Volunteer', 'Staff', 'Builder'];
                      const sortedRoles = Array.from(rolesList).sort((a, b) => {
                        const idxA = desiredOrder.indexOf(a);
                        const idxB = desiredOrder.indexOf(b);
                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                        if (idxA !== -1) return -1;
                        if (idxB !== -1) return 1;
                        return a.localeCompare(b);
                      });
                      const finalRoles = [...sortedRoles, "Others"];`;

code = code.replace(targetStr, replaceStr);

const targetLabelStr = `label={r === "Others" ? "Unassigned" : (r.toLowerCase() === "admin" ? "School Admin" : r)}`;
const replaceLabelStr = `label={r === "Others" ? "Unassigned" : (r === "Admin" ? "School Admin" : (r === "Teacher" ? "Teachers" : (r === "Student" ? "Students" : r)))}`;

code = code.replace(targetLabelStr, replaceLabelStr);

fs.writeFileSync('src/components/InternalMessagesPanel.tsx', code);
