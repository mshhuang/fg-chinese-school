import re

with open('src/pages/MyLessonPlans.tsx', 'r') as f:
    content = f.read()

# Add useLanguage hook
content = content.replace('import { formatTeacherName } from "../lib/utils";', 'import { formatTeacherName } from "../lib/utils";\nimport { useLanguage } from "../lib/i18n";')
content = content.replace('export default function MyLessonPlans() {', 'export default function MyLessonPlans() {\n  const { t } = useLanguage();')

# Replacements
replacements = {
    "'My Lesson Plans'": "t('My Lesson Plans')",
    "'Manage and collaborate on your curriculum via Google Docs or Slides.'": "t('Manage and collaborate on your curriculum via Google Docs or Slides.')",
    "> Google Doc or Slide Link": "> {t('Google Doc or Slide Link')}",
    "<span>Help</span>": "<span>{t('Help')}</span>",
    ">Help<": ">{t('Help')}<",
    "'Share a Google Doc or Slide link for administrators to view your curriculum.'": "t('Share a Google Doc or Slide link for administrators to view your curriculum.')"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/MyLessonPlans.tsx', 'w') as f:
    f.write(content)
