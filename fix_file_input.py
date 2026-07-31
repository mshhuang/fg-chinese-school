import re

with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

bad_logic = """        setAttachments(newAttachments);
     }
  };"""

good_logic = """        setAttachments(newAttachments);
        if (fileInputRef.current) fileInputRef.current.value = '';
     }
  };"""

content = content.replace(bad_logic, good_logic)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
