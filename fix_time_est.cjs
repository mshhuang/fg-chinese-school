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
    
    code = code.replace(
        /const timeStr = d\.toLocaleTimeString\('en-US', \{ timeZone: 'America\/New_York',  hour: 'numeric', minute: '2-digit' , timeZoneName: 'short'\}\);/g,
        `const timeStr = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York',  hour: 'numeric', minute: '2-digit' }) + ' EST';`
    );

    fs.writeFileSync(file, code);
});

console.log('done fixing time format to EST');
