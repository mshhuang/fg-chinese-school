with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

upload_logic = """
     let finalAttachments = [...attachments];
     for (let i = 0; i < finalAttachments.length; i++) {
         const att = finalAttachments[i];
         if (att.fileObj) {
            const filePath = `${Date.now()}_${att.name.replace(/[^a-zA-Z0-9.\\-_]/g, '')}`;
            const { error: uploadError } = await supabase.storage
                .from('newsletter_pdfs')
                .upload(filePath, att.fileObj, { cacheControl: '3600', upsert: false });
            if (!uploadError) {
                const { data } = supabase.storage.from('newsletter_pdfs').getPublicUrl(filePath);
                finalAttachments[i].url = data.publicUrl;
            }
         }
         delete finalAttachments[i].fileObj;
     }
     
     const userJson = localStorage.getItem('user');"""

content = content.replace("     const userJson = localStorage.getItem('user');", upload_logic)
content = content.replace("attachments: attachments,", "attachments: finalAttachments,")

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
