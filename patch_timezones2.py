import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # toLocaleDateString('en-CA') -> toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
    content = content.replace(".toLocaleDateString('en-CA')", ".toLocaleDateString('en-CA', { timeZone: 'America/New_York' })")
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
