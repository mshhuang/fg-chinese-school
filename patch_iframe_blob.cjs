const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

// Iframe rendering fix
const target = `<iframe src={showPdfModal.pdfData} className="flex-1 w-full min-h-[400px] rounded-xl border border-outline-variant/20" title="PDF Viewer" />`;

const replacement = `{(() => {
    let finalSrc = showPdfModal.pdfData;
    if (finalSrc && finalSrc.startsWith('data:application/pdf;base64,')) {
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
})()}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched iframe blob");
