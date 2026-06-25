const fs = require('fs');
let code = fs.readFileSync('src/pages/TeacherNewsletters.tsx', 'utf8');

const printBtn = `<button onClick={() => {
                          const w = window.open();
                          if(w) {
                              w.document.write('<iframe src="' + showPdfModal.pdfData + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
                              setTimeout(() => { w.print(); }, 500);
                          }
                       }} className="bg-primary text-on-primary hover:bg-primary/90 font-bold py-1.5 px-4 rounded-full transition-colors text-sm flex items-center gap-2 mr-2">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                          Print
                       </button>`;

code = code.replace(
  `                   <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">`,
  `                   ${printBtn}\n                   <button onClick={() => setShowPdfModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-variant text-on-surface-variant">`
);

code = code.replace(
  `<iframe src={\`\${showPdfModal.pdfData}#toolbar=0&navpanes=0&view=FitH\`} className="w-full h-full rounded-xl border border-outline-variant/20" title="PDF Viewer" />`,
  `<iframe src={showPdfModal.pdfData} className="w-full h-full rounded-xl border border-outline-variant/20" title="PDF Viewer" />`
);

fs.writeFileSync('src/pages/TeacherNewsletters.tsx', code);
