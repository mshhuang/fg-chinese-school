import re
import os
import glob

def process_file(filepath):
    if not os.path.exists(filepath):
        return

    with open(filepath, 'r') as f:
        content = f.read()
        
    if "useLanguage" not in content:
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
        func_match = re.search(r'export default function \w+\([^)]*\)\s*\{', content)
        if func_match:
            insert_pos = func_match.end()
            content = content[:insert_pos] + "\n  const { t } = useLanguage();\n" + content[insert_pos:]

    # terms to replace in JSX text
    terms_to_translate = [
        "Edit Profile", "Save Changes", "Cancel", "Phone", "Address", "Email", 
        "First Name", "Last Name", "Date of Birth", "Grade", "Role", "School",
        "Personal Information", "Contact Information", "Emergency Contact", "Medical Info",
        "Save", "Edit", "Delete", "Add", "Search...", "Filter", "Status",
        "Title", "Date", "Time", "Location", "Description", "All", "None",
        "Submit", "Send", "Reply", "Message", "Subject"
    ]
    
    for term in terms_to_translate:
        # Replace exact text nodes
        content = content.replace(f">{term}<", f">{{t('{term}')}}<")
        content = content.replace(f"> {term} <", f"> {{t('{term}')}} <")
        content = content.replace(f">{term} <", f">{{t('{term}')}} <")
        content = content.replace(f"> {term}<", f"> {{t('{term}')}}<")
        
        # specific cases like placeholder="Search..."
        content = content.replace(f'placeholder="{term}"', f'placeholder={{t("{term}")}}')
        
    with open(filepath, 'w') as f:
        f.write(content)

pages = [
    'src/pages/Profile.tsx',
    'src/pages/AdminCalendar.tsx',
    'src/pages/StaffCalendar.tsx',
    'src/pages/TeacherCalendar.tsx',
    'src/pages/VolunteerCalendar.tsx',
    'src/pages/ParentSchedule.tsx',
    'src/pages/StudentSchedule.tsx',
    'src/pages/PrincipalMessages.tsx',
    'src/pages/StaffMessages.tsx',
    'src/pages/StudentMessages.tsx',
    'src/pages/BuilderInternalMessages.tsx'
]

for p in pages:
    process_file(p)

