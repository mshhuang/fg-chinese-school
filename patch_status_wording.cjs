const fs = require('fs');

function patchFile(filepath) {
    let code = fs.readFileSync(filepath, 'utf8');
    code = code.replace(/"Published"/g, '"Ready to Post"');
    code = code.replace(/'Published'/g, "'Ready to Post'");
    fs.writeFileSync(filepath, code);
}

patchFile('src/pages/PrincipalNewsletters.tsx');
patchFile('src/pages/TeacherNewsletters.tsx');
console.log("Patched wording");
