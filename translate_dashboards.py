import re
import os

def process_file(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r') as f:
        content = f.read()
        
    if "useLanguage" in content:
        return
        
    # Add import
    import_statement = "import { useLanguage } from \"../lib/i18n\";\n"
    
    # find the last import and insert after
    last_import = 0
    for match in re.finditer(r'^import .*;', content, re.MULTILINE):
        last_import = match.end()
    
    if last_import > 0:
        content = content[:last_import] + "\n" + import_statement + content[last_import:]
    else:
        content = import_statement + content

    # Add hook inside the component
    # We find export default function ComponentName() {
    func_match = re.search(r'export default function \w+\(\)\s*\{', content)
    if func_match:
        insert_pos = func_match.end()
        content = content[:insert_pos] + "\n  const { t } = useLanguage();\n" + content[insert_pos:]
        
    # Simple replace of common terms
    terms_to_translate = [
        "Welcome back",
        "Here's what's happening with your children today.",
        "Daily Snapshot",
        "Student ID Badge",
        "Homework",
        "Due tomorrow",
        "Schedule",
        "Messages",
        "You have",
        "unread messages",
        "Today's Schedule",
        "Recent Activities",
        "School Announcements",
        "Read More",
        "Loading..."
    ]
    
    for term in terms_to_translate:
        # Match exact string in JSX, replace with {t('term')}
        # Or match >term< and replace with >{t('term')}<
        content = content.replace(f">{term}<", f">{{t('{term}')}}<")
        content = content.replace(f"> {term} <", f"> {{t('{term}')}} <")
        content = content.replace(f"> {term}<", f"> {{t('{term}')}}<")
        content = content.replace(f">{term} <", f">{{t('{term}')}} <")
        # For strings in quotes (be careful with these)
        
    with open(filepath, 'w') as f:
        f.write(content)

process_file('src/pages/ParentPortal.tsx')
process_file('src/pages/StudentPortal.tsx')
process_file('src/pages/StaffDashboard.tsx')
process_file('src/pages/VolunteerDashboard.tsx')
process_file('src/pages/AdminDashboard.tsx')
process_file('src/pages/BuilderDashboard.tsx')

