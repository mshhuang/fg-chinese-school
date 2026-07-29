const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

const target = `  const handleDownload = () => {
      if (!showPdfModal?.pdfData) return;
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
      const a = document.createElement("a");
      a.href = finalSrc;
      a.download = showPdfModal.pdfName || "newsletter.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };`;

const replacement = `  const handleDownload = () => {
      if (!pdfBlobUrl) return;
      const a = document.createElement("a");
      a.href = pdfBlobUrl;
      a.download = showPdfModal.pdfName || "newsletter.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
console.log("Patched download blob 2");
