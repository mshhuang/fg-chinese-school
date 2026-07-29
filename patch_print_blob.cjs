const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

const target = `w.document.write('<iframe src="' + showPdfModal.pdfData + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');`;

const replacement = `let printSrc = showPdfModal.pdfData;
                              if (printSrc && printSrc.startsWith('data:application/pdf;base64,')) {
                                  try {
                                      const base64 = printSrc.split(',')[1];
                                      const byteString = atob(base64);
                                      const ab = new ArrayBuffer(byteString.length);
                                      const ia = new Uint8Array(ab);
                                      for (let i = 0; i < byteString.length; i++) {
                                          ia[i] = byteString.charCodeAt(i);
                                      }
                                      const blob = new Blob([ab], { type: 'application/pdf' });
                                      printSrc = URL.createObjectURL(blob);
                                  } catch(e) {}
                              }
                              w.document.write('<iframe src="' + printSrc + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched print blob");
