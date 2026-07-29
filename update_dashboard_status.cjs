const fs = require('fs');

function patch(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    code = code.replace(/"Ready to Post"/g, '"Approved"');
    code = code.replace(/'Ready to Post'/g, "'Approved'");
    fs.writeFileSync(filepath, code);
}
patch('src/components/DashboardNotifications.tsx');
patch('src/pages/TeacherDashboard.tsx');
console.log("Updated dash");
