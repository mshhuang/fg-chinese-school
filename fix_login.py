import re

with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

content = re.sub(r"          supabase\.from\('user_sessions'\)\.insert\(\{[\s\S]*?\}\)\.then\(\);\n", "", content)

with open('src/pages/Login.tsx', 'w') as f:
    f.write(content)
