import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

replacement = """     try {
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
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");"""

# Use regex to match the block
pattern = r"     try \{\n       const \{ data, error \} = await supabase.from\('newsletters'\).insert\(\[\{\n           title,\n           author_id: authorId,\n           class_id: classId,\n           content: JSON.stringify\(payloadProps\)\n       \}\] as any\)\.select\(\);\n       if \(error\) \{\n           if \(error\.code === '42501'\) \{\n               alert\(\"Database Error: Row-Level Security \(RLS\) is blocking inserts to the 'newsletters' table\. Please check policies\.\"\);\n           \}\n           throw error;\n       \}\n       alert\(\"Newsletter successfully saved to database!\"\);\n       await loadNewsletters\(\);\n     \} catch \(e\) \{\n       console\.error\(\"Failed to create newsletter\", e\);\n       alert\(\"Failed to create newsletter\"\);\n     \}\n     \n     setShowModal\(false\);\n     setTitle\(\"\"\); setContent\(\"\"\); setPdfFile\(null\); setPdfFileObj\(null\); setPdfName\(\"\"\);"

content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
