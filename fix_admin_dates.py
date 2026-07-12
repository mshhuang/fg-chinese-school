import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

def replacer(match):
    date_var = match.group(1)
    return f"""     const [year, month, day] = {date_var}.split('-').map(Number);
     const startOfDay = new Date(year, month - 1, day);
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date(year, month - 1, day);
     endOfDay.setHours(23, 59, 59, 999);"""

# Replace all occurrences of the bad date parsing
pattern = r"     const startOfDay = new Date\((.*?)\);\n     startOfDay\.setHours\(0, 0, 0, 0\);\n     const endOfDay = new Date\(\1\);\n     endOfDay\.setHours\(23, 59, 59, 999\);"

new_content, count = re.subn(pattern, replacer, content)
print("Replacements:", count)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(new_content)
