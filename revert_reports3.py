import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

idx_start = content.find("{activeTab === 'credentials' && (")
if idx_start != -1:
    idx_end = content.find("            {activeTab === 'attendance' && (", idx_start)
    if idx_end != -1:
        content = content[:idx_start] + content[idx_end:]

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("done")
