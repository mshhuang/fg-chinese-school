const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

code = code.replace('{showPdfModal.pdfData ? (\n                        {(() => {', '{showPdfModal.pdfData ? (\n                        (() => {');
code = code.replace('})()}\n                    ) : (', '})()\n                    ) : (');

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Fixed jsx");
