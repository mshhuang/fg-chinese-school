import re

with open('src/components/InternalMessagesPanel.tsx', 'r') as f:
    content = f.read()

pattern = r"// Fallback polling.*?\(channel as any\)\._pollingInterval = intervalId;"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('src/components/InternalMessagesPanel.tsx', 'w') as f:
    f.write(content)
