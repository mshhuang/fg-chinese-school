import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

# Replace the credentials tab section
pattern = r"\{activeTab === 'credentials' && \(\s*<div className=\"space-y-8\">[\s\S]*?<!-- Unassigned Users / Staff Section -->"
# Wait, let me check the exact string to replace from the previous `grep`.

