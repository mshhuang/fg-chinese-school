import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

bad_logic = """     let finalAttachments = [...attachments];"""
good_logic = """     setIsUploading(true);
     let finalAttachments = attachments.map(a => ({...a}));"""

content = content.replace(bad_logic, good_logic)

bad_end = """     setShowModal(false);
     setEditingNewsletterId(null);
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");
  };"""

good_end = """     setShowModal(false);
     setEditingNewsletterId(null);
     setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName(""); setAttachments([]);
     setIsUploading(false);
  };"""

content = content.replace(bad_end, good_end)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
