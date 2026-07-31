import re

with open('src/pages/Announcements.tsx', 'r') as f:
    lines = f.readlines()

div_count = 0
for i, line in enumerate(lines):
    opens = len(re.findall(r'<div\b[^>]*>', line))
    closes = len(re.findall(r'</div\s*>', line))
    div_count += opens - closes
    if div_count < 0:
        print(f"Error at line {i+1}: too many closing divs")
        break
print("Final div balance:", div_count)
