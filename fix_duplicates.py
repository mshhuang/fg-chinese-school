import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

# I will use a simple deduplication script for the Messages object
# It's a JSON-like object.
import ast

def remove_duplicates(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if '"Messages":' in line and start_idx == -1: # Just to find where the translations start
            pass
        if 'export const translations = {' in line:
            start_idx = i
        if start_idx != -1 and '};' in line:
            end_idx = i
            
    if start_idx == -1 or end_idx == -1:
        return
        
    translation_lines = lines[start_idx+1:end_idx]
    
    seen_keys = set()
    deduped_lines = []
    
    # Process from the bottom up to keep the latest added keys (which are typically at the top where we inserted them, wait no, we inserted at `"New Announcement":` which is somewhere in the middle).
    # Wait, we inserted BEFORE `"New Announcement":`. So the newly added ones are before the old ones.
    # Therefore, if we see duplicates, we should keep the FIRST one.
    
    for line in translation_lines:
        match = re.match(r'^\s*"([^"]+)"\s*:', line)
        if match:
            key = match.group(1)
            if key not in seen_keys:
                seen_keys.add(key)
                deduped_lines.append(line)
        else:
            deduped_lines.append(line)
            
    new_content = "".join(lines[:start_idx+1]) + "".join(deduped_lines) + "".join(lines[end_idx:])
    
    with open(file_path, 'w') as f:
        f.write(new_content)

remove_duplicates('src/lib/i18n.tsx')
