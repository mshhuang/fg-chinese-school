const fs = require('fs');
let code = fs.readFileSync('src/components/SupportWidget.tsx', 'utf8');
code = code.replace("import { toJpeg } from 'html-to-image';", "import html2canvas from 'html2canvas';");
code = code.replace(/const dataUrl = await toJpeg\(document\.body.*?\n      }\);/s, `const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        ignoreElements: (element) => {
          if (element.tagName === 'LINK') {
            const href = element.href;
            if (href && !href.startsWith(window.location.origin) && !href.startsWith('/')) {
              return true; // exclude remote stylesheets which crash cssRules
            }
          }
          return false;
        }
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);`);
fs.writeFileSync('src/components/SupportWidget.tsx', code);
