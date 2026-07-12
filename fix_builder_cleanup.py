import re

with open('src/pages/BuilderDashboard.tsx', 'r') as f:
    content = f.read()

pattern = r"clearInterval\(interval\);"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('src/pages/BuilderDashboard.tsx', 'w') as f:
    f.write(content)
