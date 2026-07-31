import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

bad_logic = """  const handleSave = async (status: "Draft" | "Pending Approval") => {
     if (!title.trim()) return alert("Title is required");
     
     let finalPdfData = pdfFile;"""

good_logic = """  const handleSave = async (status: "Draft" | "Pending Approval") => {
     if (!title.trim()) return alert("Title is required");
     setIsUploading(true);
     let finalPdfData = pdfFile;"""

content = content.replace(bad_logic, good_logic)
content = content.replace("     setIsUploading(true);\n     let finalAttachments", "     let finalAttachments")

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
