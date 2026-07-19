import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.startswith('import { supabase } from "../lib/supabase";'):
        lines[i] = line.rstrip() + '\nimport { ParentChatbot } from "../components/ParentChatbot";\n'
        break

for i in range(len(lines)-1, -1, -1):
    if lines[i].startswith('  );'):
        if lines[i-1].startswith('    </div>'):
            lines[i-1] = '      <ParentChatbot />\n    </div>\n'
        break

with open('src/pages/ParentPortal.tsx', 'w') as f:
    f.writelines(lines)
print("Patched ParentPortal.tsx")
