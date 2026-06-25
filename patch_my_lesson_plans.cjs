const fs = require('fs');
let code = fs.readFileSync('src/pages/MyLessonPlans.tsx', 'utf8');

code = code.replace(
  "title: 'Google Doc Link',",
  "title: 'Google Doc Link',\n               week_number: 1,"
);

// We should also make sure the fetch query uses .limit(1) and orders it so it doesn't fail if there are multiple.
code = code.replace(
  ".maybeSingle();",
  ".limit(1).maybeSingle();"
);

fs.writeFileSync('src/pages/MyLessonPlans.tsx', code);
