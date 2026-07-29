const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');

code = code.replace(
    /let classNames = studentEnrolls\.map\(e => e\.classes\?\.class_name\)\.filter\(Boolean\);/g,
    `let classNames = studentEnrolls.map((e: any) => e.classes?.class_name).filter(Boolean);`
);

fs.writeFileSync('src/pages/AdminReports.tsx', code);
console.log('done fixing');
