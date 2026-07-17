import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # toLocaleString() -> toLocaleString('en-US', { timeZone: 'America/New_York' })
    content = content.replace(".toLocaleString()", ".toLocaleString('en-US', { timeZone: 'America/New_York' })")
    
    # toLocaleString([], { ... }) -> toLocaleString('en-US', { timeZone: 'America/New_York', ... })
    content = re.sub(r"\.toLocaleString\(\s*\[\]\s*,\s*\{", r".toLocaleString('en-US', { timeZone: 'America/New_York', ", content)

    # toLocaleDateString() -> toLocaleDateString('en-US', { timeZone: 'America/New_York' })
    content = content.replace(".toLocaleDateString()", ".toLocaleDateString('en-US', { timeZone: 'America/New_York' })")
    
    # toLocaleDateString('en-US', { ... }) -> toLocaleDateString('en-US', { timeZone: 'America/New_York', ... })
    content = re.sub(r"\.toLocaleDateString\(\s*'en-US'\s*,\s*\{", r".toLocaleDateString('en-US', { timeZone: 'America/New_York', ", content)

    # toLocaleTimeString() -> toLocaleTimeString('en-US', { timeZone: 'America/New_York' })
    content = content.replace(".toLocaleTimeString()", ".toLocaleTimeString('en-US', { timeZone: 'America/New_York' })")
    
    # toLocaleTimeString([], { ... }) -> toLocaleTimeString('en-US', { timeZone: 'America/New_York', ... })
    content = re.sub(r"\.toLocaleTimeString\(\s*\[\]\s*,\s*\{", r".toLocaleTimeString('en-US', { timeZone: 'America/New_York', ", content)
    
    # toLocaleTimeString('en-US', { ... }) -> toLocaleTimeString('en-US', { timeZone: 'America/New_York', ... })
    content = re.sub(r"\.toLocaleTimeString\(\s*'en-US'\s*,\s*\{", r".toLocaleTimeString('en-US', { timeZone: 'America/New_York', ", content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
