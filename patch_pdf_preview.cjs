const fs = require('fs');
let code = fs.readFileSync('src/pages/BuilderStorage.tsx', 'utf8');

const targetStr = `<iframe src={previewFile.url} className="w-full h-full rounded-lg shadow-sm border border-outline-variant/40 bg-white" title="PDF Preview" />`;

const replaceStr = `<div className="w-full h-full flex flex-col items-center justify-center gap-6 text-on-surface-variant">
                  <FileText className="w-20 h-20 opacity-50" />
                  <p className="text-lg">PDFs might not preview inline depending on your browser.</p>
                  <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary/90 transition-colors shadow-sm">
                    Open PDF in New Tab
                  </a>
                </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/BuilderStorage.tsx', code);
console.log("Patched!");
