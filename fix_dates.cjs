const fs = require('fs');

const files = [
    'src/pages/AttendanceSheet.tsx',
    'src/pages/StaffAttendance.tsx',
    'src/pages/ParentPortal.tsx',
    'src/pages/StudentPortal.tsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    
    // Fix existing dd/mm/yyyy string
    code = code.replace(
        /\`\$\{d\.getDate\(\)\.toString\(\)\.padStart\(2, '0'\)\}\/\$\{\(d\.getMonth\(\) \+ 1\)\.toString\(\)\.padStart\(2, '0'\)\}\/\$\{d\.getFullYear\(\)\}\`/g,
        `\`\${(d.getMonth() + 1).toString().padStart(2, '0')}/\${d.getDate().toString().padStart(2, '0')}/\${d.getFullYear()}\``
    );

    // Fix the other m/d/yyyy string
    code = code.replace(
        /\`\$\{\(d\.getMonth\(\) \+ 1\)\}\/\$\{d\.getDate\(\)\}\/\$\{d\.getFullYear\(\)\}\`/g,
        `\`\${(d.getMonth() + 1).toString().padStart(2, '0')}/\${d.getDate().toString().padStart(2, '0')}/\${d.getFullYear()}\``
    );

    fs.writeFileSync(file, code);
});

console.log('done fixing dates');
