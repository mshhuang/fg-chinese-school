const fs = require('fs');
let code = fs.readFileSync('src/pages/PrincipalNewsletters.tsx', 'utf8');

const targetStr = `const reader = new FileReader();
      reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          
          const newsletter = newsletters.find(n => n.id === showPdfModal.id);
          if (!newsletter) return;
          const updatedProps = { ...newsletter, pdfData: base64, pdfName: file.name };
          delete updatedProps.id;
          delete updatedProps.title;
          delete updatedProps.class_id;
          try {
              const { error } = await supabase.from('newsletters').update(updatedProps).eq('newsletter_id', showPdfModal.id);
              if (error) throw error;
              alert("Edited newsletter uploaded successfully.");
              setShowPdfModal(null);
              await loadNewsletters();
          } catch (err) {
              console.error("Upload failed", err);
              alert("Failed to upload edited newsletter.");
          }
      };
      reader.readAsDataURL(file);
      e.target.value = '';`;

const newStr = `setLoading(true);
      try {
          const filePath = \`\${Date.now()}_\${file.name.replace(/[^a-zA-Z0-9.\\-_]/g, '')}\`;
          const { error: uploadError } = await supabase.storage
              .from('newsletter_pdfs')
              .upload(filePath, file, { cacheControl: '3600', upsert: false });
              
          let finalPdfData = "";
          if (!uploadError) {
              const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl(filePath);
              finalPdfData = data.publicUrl;
          } else {
              console.error("Storage upload failed:", uploadError);
              alert("Could not upload PDF to storage: " + uploadError.message);
              setLoading(false);
              return;
          }

          const newsletter = newsletters.find(n => n.id === showPdfModal.id);
          if (!newsletter) {
             setLoading(false);
             return;
          }
          const updatedProps = { ...newsletter, pdfData: finalPdfData, pdfName: file.name };
          delete updatedProps.id;
          delete updatedProps.title;
          delete updatedProps.class_id;
          
          const { error } = await supabase.from('newsletters').update(updatedProps).eq('newsletter_id', showPdfModal.id);
          if (error) throw error;
          alert("Edited newsletter uploaded successfully.");
          setShowPdfModal(null);
          await loadNewsletters();
      } catch (err) {
          console.error("Upload failed", err);
          alert("Failed to upload edited newsletter.");
      } finally {
          setLoading(false);
      }
      e.target.value = '';`;

if (!code.includes("const reader = new FileReader();")) {
    console.error("target string not found");
} else {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('src/pages/PrincipalNewsletters.tsx', code);
    console.log("patched!");
}
