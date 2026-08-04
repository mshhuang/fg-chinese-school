const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherDashboard.tsx', 'utf8');

code = code.replace(
  /Today's Schedule/g,
  `{t("Today's Schedule")}`
);
code = code.replace(
  />\s*\{t\("Today's Schedule"\)\}\s*<\/h3>/g,
  '>{t("Today\'s Schedule")}</h3>'
);


fs.writeFileSync('src/pages/TeacherDashboard.tsx', code);
