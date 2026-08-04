import re

with open('src/pages/PrincipalDashboard.tsx', 'r') as f:
    content = f.read()

# Import useLanguage
if 'useLanguage' not in content:
    content = content.replace(
        'import { formatTeacherName, extractPlainText } from "../lib/utils";',
        'import { formatTeacherName, extractPlainText } from "../lib/utils";\nimport { useLanguage } from "../lib/i18n";'
    )

# Add t to component
if 'const { t } = useLanguage();' not in content:
    content = content.replace(
        'const navigate = useNavigate();',
        'const navigate = useNavigate();\n  const { t } = useLanguage();'
    )

# Use t for Good morning
content = content.replace('setGreeting("Good morning")', 'setGreeting(t("Good morning"))')
content = content.replace('setGreeting("Good afternoon")', 'setGreeting(t("Good afternoon"))')
content = content.replace('setGreeting("Good evening")', 'setGreeting(t("Good evening"))')

content = content.replace('Here is what\\\'s happening at your school today.', '{t("Here is what\'s happening at your school today.")}')

content = content.replace('Quick Stats', '{t("Quick Stats")}')
content = content.replace('Total Students', '{t("Total Students")}')
content = content.replace('Active Classes', '{t("Active Classes")}')
content = content.replace('Absences Today', '{t("Absences Today")}')
content = content.replace('Attendance Overview', '{t("Attendance Overview")}')
content = content.replace('Recent Activity', '{t("Recent Activity")}')
content = content.replace('Latest Announcements', '{t("Latest Announcements")}')
content = content.replace('>View All<', '>{t("View All")}<')

with open('src/pages/PrincipalDashboard.tsx', 'w') as f:
    f.write(content)

