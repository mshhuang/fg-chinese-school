with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");  const handleDelete = async (id: string | number) => {',
    'setTitle(""); setContent(""); setPdfFile(null); setPdfFileObj(null); setPdfName("");\n  };\n\n  const handleDelete = async (id: string | number) => {'
)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(content)
