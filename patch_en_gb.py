import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    
    # We want to replace 'en-US' with 'en-GB' but only for toLocaleDateString, toLocaleTimeString, or toLocaleString when used with Date
    # Actually, replacing all 'en-US' in toLocale... calls for dates is what we want.
    content = re.sub(
        r"toLocaleDateString\('en-US'",
        "toLocaleDateString('en-GB'",
        content
    )
    content = re.sub(
        r"toLocaleTimeString\('en-US'",
        "toLocaleTimeString('en-GB'",
        content
    )
    # Be careful with toLocaleString. If there's new Date(..).toLocaleString('en-US'
    content = re.sub(
        r"\.toLocaleString\('en-US'",
        ".toLocaleString('en-GB'",
        content
    )
    # Also string interpolations
    content = re.sub(
        r"\$\{d\.getMonth\(\) \+ 1\}/\$\{d\.getDate\(\)\}/\$\{d\.getFullYear\(\)\}",
        r"${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}",
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
