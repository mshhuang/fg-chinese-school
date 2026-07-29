const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');
code = code.replace('<ReportPrintHeader title="STUDENT LOGINS BY CLASS" />', '<ReportPrintHeader title="STUDENT ACTIVITY BY CLASS" />');
fs.writeFileSync('src/pages/AdminReports.tsx', code);
