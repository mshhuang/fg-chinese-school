const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// 1. Add state for the pdfUrl
code = code.replace(
  'const [postModal, setPostModal] = useState<any>(null);',
  'const [postModal, setPostModal] = useState<any>(null);\n  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);'
);

// 2. Add useEffect to manage the blob URL lifecycle
code = code.replace(
  'useEffect(() => {\n    loadNewsletters();',
  `useEffect(() => {
    if (showPdfModal?.pdfData && showPdfModal.pdfData.includes('base64,')) {
      try {
        const base64 = showPdfModal.pdfData.split(',')[1];
        const byteString = atob(base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch(e) {
        setPdfBlobUrl(showPdfModal.pdfData);
      }
    } else {
      setPdfBlobUrl(showPdfModal?.pdfData || null);
    }
  }, [showPdfModal?.pdfData]);

  useEffect(() => {
    loadNewsletters();`
);

// 3. Replace iframe src
const iframeTarget = `{showPdfModal.pdfData ? (
                        (() => {
    let finalSrc = showPdfModal.pdfData;
    if (finalSrc && finalSrc.includes('base64,')) {
        try {
            const base64 = finalSrc.split(',')[1];
            const byteString = atob(base64);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'application/pdf' });
            finalSrc = URL.createObjectURL(blob);
        } catch(e) {}
    }
    return <iframe src={finalSrc} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />
})()
                    ) : (`;

const iframeReplace = `{pdfBlobUrl ? (
                        <iframe src={pdfBlobUrl} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />
                    ) : (`;

code = code.replace(iframeTarget, iframeReplace);

// 4. Print uses pdfBlobUrl
code = code.replace(/w\.document\.write\('<iframe src="' \+ printSrc \+ '"/g, 'w.document.write(\'<iframe src="\' + pdfBlobUrl + \'"');

const printTarget = `let printSrc = showPdfModal.pdfData;
                              if (printSrc && printSrc.includes('base64,')) {
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
                              }`;
code = code.replace(printTarget, '');

fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched blob memo");
