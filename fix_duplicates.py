import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    content = content.replace("{ timeZone: 'America/New_York',  timeZone: 'America/New_York'", "{ timeZone: 'America/New_York'")
    content = content.replace("{ timeZone: 'America/New_York', timeZone: 'America/New_York'", "{ timeZone: 'America/New_York'")
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
