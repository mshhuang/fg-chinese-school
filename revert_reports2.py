import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

# Replace activeTab state
content = content.replace(
    "'enrollments' | 'credentials' | 'attendance'",
    "'enrollments' | 'attendance'"
)

# Remove the button
content = re.sub(r"<button[^>]*onClick=\{\(\) => setActiveTab\('credentials'\)\}.*?</button>", '', content, flags=re.DOTALL)

# Remove the tab content
# Need to be careful with the brace matching. Let's find the start of the credentials block and the start of the attendance block.
idx_start = content.find("{activeTab === 'credentials' && (")
if idx_start != -1:
    idx_end = content.find("{activeTab === 'attendance' && (", idx_start)
    if idx_end != -1:
        content = content[:idx_start] + content[idx_end:]

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)

print("done")
