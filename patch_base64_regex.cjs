const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

code = code.replace(/finalSrc\.startsWith\('data:application\/pdf;base64,'\)/g, "finalSrc.includes('base64,')");
code = code.replace(/printSrc\.startsWith\('data:application\/pdf;base64,'\)/g, "printSrc.includes('base64,')");

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched base64 regex");
