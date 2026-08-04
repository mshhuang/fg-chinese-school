import re

with open('src/pages/TeacherAssignmentBoard.tsx', 'r') as f:
    content = f.read()

# Add useLanguage
if 'useLanguage' not in content:
    content = content.replace('import { cn } from "../lib/utils";', 'import { cn } from "../lib/utils";\nimport { useLanguage } from "../lib/i18n";')

# Add const { t } = useLanguage();
if 'const { t } = useLanguage();' not in content:
    content = content.replace('const [error, setError] = useState<string | null>(null);', 'const [error, setError] = useState<string | null>(null);\n  const { t } = useLanguage();')

# Replace texts
content = content.replace('>Assignments</h1>', '>{t(\'Assignments\')}</h1>')
content = content.replace('>Manage homework and assignments for your classes.</p>', '>{t(\'Manage homework and assignments for your classes.\')}</p>')
content = content.replace('>Select Class:</label>', '>{t(\'Select Class:\')}</label>')
content = content.replace('value="">All Classes</option>', 'value="">{t(\'All Classes\')}</option>')
content = content.replace('>Create Assignment</span>', '>{t(\'Create Assignment\')}</span>')

with open('src/pages/TeacherAssignmentBoard.tsx', 'w') as f:
    f.write(content)
