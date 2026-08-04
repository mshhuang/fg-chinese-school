import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

# Extract everything before the translations object
pre_match = re.search(r'(.*?const translations: Translations = \{\n)', content, re.DOTALL)
if not pre_match:
    print("Could not find translation object start")
    exit(1)

pre_text = pre_match.group(1)

# Extract everything inside the translations object
translations_match = re.search(r'const translations: Translations = \{\n(.*?\n)\};\n\ninterface LanguageContextType', content, re.DOTALL)
if not translations_match:
    print("Could not find translation object content")
    exit(1)

trans_content = translations_match.group(1)
post_text = "\n};\n\ninterface LanguageContextType" + content.split("interface LanguageContextType")[1]

# Go through the lines and only keep the first occurrence of each key
lines = trans_content.split('\n')
new_lines = []
seen_keys = set()

for line in lines:
    if line.strip().startswith('//') or line.strip() == '':
        new_lines.append(line)
        continue
    
    key_match = re.search(r'^\s*"([^"]+)":', line)
    if key_match:
        k = key_match.group(1)
        if k not in seen_keys:
            seen_keys.add(k)
            new_lines.append(line)
    else:
        new_lines.append(line)

new_content = pre_text + "\n".join(new_lines) + post_text

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(new_content)

print("Duplicates removed.")
