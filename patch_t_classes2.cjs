const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherClasses.tsx', 'utf8');

if (!code.includes('import { useLanguage } from "../lib/i18n";')) {
  code = `import { useLanguage } from "../lib/i18n";\n` + code;
}

fs.writeFileSync('src/pages/TeacherClasses.tsx', code);
