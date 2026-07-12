import re

with open('src/components/SupportWidget.tsx', 'r') as f:
    content = f.read()

# Remove the block inserting into error_logs
content = re.sub(r"      // Log to error_logs as a support ticket\n\s*await supabase\.from\('error_logs'\)\.insert\(\{[\s\S]*?\}\);\n", "", content)

with open('src/components/SupportWidget.tsx', 'w') as f:
    f.write(content)
