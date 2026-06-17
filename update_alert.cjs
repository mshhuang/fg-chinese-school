const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminEnrollments.tsx', 'utf8');

const oldAlert = `    } else {
       alert("Error creating enrollments: " + error.message);
    }`;

const newAlert = `    } else {
       console.error("Supabase insert error details:", error);
       alert("Error creating enrollments: " + error.message + " | Details: " + JSON.stringify(error));
    }`;

content = content.replace(oldAlert, newAlert);
fs.writeFileSync('src/pages/AdminEnrollments.tsx', content);
