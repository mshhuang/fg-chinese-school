with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    lines = f.readlines()

new_lines = lines[:183] + [
"""     try {
       if (editingNewsletterId) {
           const { error } = await supabase.from('newsletters').update({
               title,
               content: JSON.stringify(payloadProps)
           }).eq('newsletter_id', editingNewsletterId);
           if (error) throw error;
           alert("Newsletter successfully updated!");
       } else {
           const { data, error } = await supabase.from('newsletters').insert([{
               title,
               author_id: authorId,
               class_id: classId,
               content: JSON.stringify(payloadProps)
           }] as any).select();
           if (error) {
               if (error.code === '42501') alert("Database Error: Row-Level Security (RLS) is blocking inserts to the 'newsletters' table. Please check policies.");
               throw error;
           }
           alert("Newsletter successfully saved to database!");
       }
       await loadNewsletters();
     } catch (e) {
       console.error("Failed to save newsletter", e);
       alert("Failed to save newsletter");
     }
     
     setShowModal(false);
     setEditingNewsletterId(null);
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");\n"""
] + lines[208:]

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.writelines(new_lines)
