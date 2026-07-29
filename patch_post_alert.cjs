const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

const target = `alert("Posted to announcement board successfully.");`;

const replacement = `const selectedClassNames = availableClasses.filter(c => selectedClasses.includes(c.class_id)).map(c => c.class_name).join(', ');
          alert(\`Posted to announcement board successfully for classes: \${selectedClassNames}\`);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched post alert");
