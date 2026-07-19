import re
import os

tables = set()
for root, _, files in os.walk('src'):
    for file in files:
        if not file.endswith('.tsx') and not file.endswith('.ts'): continue
        with open(os.path.join(root, file), 'r') as f:
            content = f.read()
            matches = re.findall(r"supabase\.from\(['\"]([a-zA-Z0-9_]+)['\"]\)", content)
            for m in matches: tables.add(m)
print("Tables:", sorted(list(tables)))
