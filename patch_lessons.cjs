const fs = require('fs');
let code = fs.readFileSync('src/pages/MyLessonPlans.tsx', 'utf8');
code = code.replace("min-h-[400px]", "min-h-[800px]");
fs.writeFileSync('src/pages/MyLessonPlans.tsx', code);
