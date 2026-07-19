import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    
    def repl(m):
        inner = m.group(1).replace(", timeZoneName: 'short'", "")
        return f"toLocaleTimeString('en-US', {{{inner}, timeZoneName: 'short'}})"

    content = re.sub(
        r"toLocaleTimeString\('en-US',\s*\{([^}]*timeZone:\s*'America/New_York'[^}]*)\}\)",
        repl,
        content
    )
    
    def repl2(m):
        inner = m.group(1).replace(", timeZoneName: 'short'", "")
        return f"toLocaleString('en-US', {{{inner}, timeZoneName: 'short'}})"

    content = re.sub(
        r"toLocaleString\('en-US',\s*\{([^}]*timeZone:\s*'America/New_York'[^}]*)\}\)",
        repl2,
        content
    )

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
