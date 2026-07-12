import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

# 1. Add editingNewsletterId state
content = content.replace(
    '  const [pdfName, setPdfName] = useState("");',
    '  const [pdfName, setPdfName] = useState("");\n  const [editingNewsletterId, setEditingNewsletterId] = useState<string | null>(null);'
)

# 2. Add handleEditInit
edit_init_func = """
  const handleEditInit = (news: any) => {
     setEditingNewsletterId(news.id);
     setTitle(news.title);
     setAudience(news.audience);
     setContent(news.content);
     setPdfName(news.pdfName || "");
     setPdfFile(news.pdfData || null);
     setPdfFileObj(null);
     setShowModal(true);
  };
"""
content = content.replace(
    '  const handleCreate = async (status: "Draft" | "Pending Approval") => {',
    edit_init_func + '\n  const handleSave = async (status: "Draft" | "Pending Approval") => {'
)

# 3. Modify create button onClick
content = content.replace('onClick={() => setShowModal(true)}', 'onClick={() => { setEditingNewsletterId(null); setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName(""); setShowModal(true); }}')

# 4. Modify handleCreate body
content = content.replace(
    '''     try {
       const { data, error } = await supabase.from('newsletters').insert([{
           title,
           author_id: authorId,
           class_id: classId,
           content: JSON.stringify(payloadProps)
       }] as any).select();
       if (error) {
           if (error.code === '42501') {
               alert("Database Error: Row-Level Security (RLS) is blocking inserts to the 'newsletters' table. Please check policies.");
           }
           throw error;
       }
       alert("Newsletter successfully saved to database!");
       await loadNewsletters();
     } catch (e) {
       console.error("Failed to create newsletter", e);
       alert("Failed to create newsletter");
     }
     
     setShowModal(false);
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");''',
    '''     try {
       if (editingNewsletterId) {
           const { error } = await supabase.from('newsletters').update({
               title,
               content: JSON.stringify(payloadProps)
           }).eq('newsletter_id', editingNewsletterId);
           if (error) {
               if (error.code === '42501') {
                   alert("Database Error: RLS is blocking updates. Please check policies.");
               }
               throw error;
           }
           alert("Newsletter successfully updated!");
       } else {
           const { data, error } = await supabase.from('newsletters').insert([{
               title,
               author_id: authorId,
               class_id: classId,
               content: JSON.stringify(payloadProps)
           }] as any).select();
           if (error) {
               if (error.code === '42501') {
                   alert("Database Error: Row-Level Security (RLS) is blocking inserts to the 'newsletters' table. Please check policies.");
               }
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
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");'''
)

# 5. Add Edit button
edit_btn = """                       {(news.status === "Draft" || news.status === "Rejected") && (
                         <>
                         <button onClick={() => handleEditInit(news)} className="w-8 h-8 rounded-full hover:bg-surface-variant hover:text-primary flex items-center justify-center text-on-surface-variant transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleSubmitForApproval(news.id)} className="w-8 h-8 rounded-full hover:bg-tertiary-container/50 hover:text-tertiary flex items-center justify-center text-on-surface-variant transition-colors" title="Submit for Approval">
                            <Send className="w-4 h-4" />
                         </button>
                         </>
                       )}"""

content = content.replace(
    """                       {(news.status === "Draft" || news.status === "Rejected") && (
                         <button onClick={() => handleSubmitForApproval(news.id)} className="w-8 h-8 rounded-full hover:bg-tertiary-container/50 hover:text-tertiary flex items-center justify-center text-on-surface-variant transition-colors" title="Submit for Approval">
                            <Send className="w-4 h-4" />
                         </button>
                       )}""",
    edit_btn
)

# 6. Change modal handleCreate to handleSave
content = content.replace('onClick={() => handleCreate("Draft")}', 'onClick={() => handleSave("Draft")}')
content = content.replace('onClick={() => handleCreate("Pending Approval")}', 'onClick={() => handleSave("Pending Approval")}')

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
