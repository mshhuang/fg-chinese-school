import re

with open('src/pages/TeacherAssignmentBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { cn } from '../lib/utils';", "import { cn } from '../lib/utils';\nimport { useLanguage } from '../lib/i18n';")
content = content.replace("export default function TeacherAssignmentBoard() {\n  const location = useLocation();", "export default function TeacherAssignmentBoard() {\n  const { t } = useLanguage();\n  const location = useLocation();")

with open('src/pages/TeacherAssignmentBoard.tsx', 'w') as f:
    f.write(content)
