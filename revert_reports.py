import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

# Replace activeTab state
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'credentials' | 'attendance'>('teachers');",
    "const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'classes' | 'enrollments' | 'attendance'>('teachers');"
)

# Remove the button
button_regex = re.compile(r"<button\s+onClick=\{\(\) => setActiveTab\('credentials'\)\}.*?<KeyRound className=\"w-4 h-4\" /> Credentials\s+</button>", re.DOTALL)
content = re.sub(button_regex, '', content)

# Remove the tab content
content_regex = re.compile(r"\{activeTab === 'credentials' && \(\s*<div>\s*<ReportPrintHeader title=\"User Credentials Report\".*?(?=\{activeTab === 'attendance' && \()", re.DOTALL)
content = re.sub(content_regex, '', content)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)

print("done")
