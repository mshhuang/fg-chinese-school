import re

with open('src/pages/PrincipalNewsletters.tsx', 'r') as f:
    content = f.read()

bad_logic = """      const atts = [];
      if (postModal.pdfData) {
          atts.push({ name: postModal.pdfName || "newsletter.pdf", url: postModal.pdfData });
      }"""

good_logic = """      let atts: any[] = [];
      if (postModal.attachments && Array.isArray(postModal.attachments)) {
          atts = [...postModal.attachments];
      }
      if (postModal.pdfData) {
          atts.push({ name: postModal.pdfName || "newsletter.pdf", url: postModal.pdfData });
      }"""

content = content.replace(bad_logic, good_logic)

with open('src/pages/PrincipalNewsletters.tsx', 'w') as f:
    f.write(content)
