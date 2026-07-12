import re

with open('src/lib/logSystemEvent.ts', 'r') as f:
    content = f.read()

# Remove the block inserting into error_logs
content = re.sub(r"if \(type === 'error' \|\| type === 'warning'\) \{[\s\S]*?\} catch \(e\) \{\}\n\s+\}", "", content)

with open('src/lib/logSystemEvent.ts', 'w') as f:
    f.write(content)
