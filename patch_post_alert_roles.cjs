const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

const target = `const selectedClassNames = availableClasses.filter(c => selectedClasses.includes(c.class_id)).map(c => c.class_name).join(', ');
          alert(\`Posted to announcement board successfully for classes: \${selectedClassNames}\`);`;

const replacement = `const selectedClassNames = availableClasses.filter(c => selectedClasses.includes(c.class_id)).map(c => c.class_name);
          const selectedRoleNames = availableRoles.filter(r => selectedRoles.includes(r.role_id)).map(r => r.role_name + 's');
          const allTargets = [...selectedRoleNames, ...selectedClassNames].join(', ');
          alert(\`Posted to announcement board successfully to: \${allTargets}\`);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched alert");
