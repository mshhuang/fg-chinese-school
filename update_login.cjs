const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');
content = content.replace(/return;\n                           }\n                           let firstName = 'Demo';/g, 
`return;
                           }
                           
                           if (localStorage.getItem('system_maintenance') === 'true') {
                               alert("System is currently under maintenance. Please try again later.");
                               return;
                           }

                           let firstName = 'Demo';`);
fs.writeFileSync('src/pages/Login.tsx', content);
