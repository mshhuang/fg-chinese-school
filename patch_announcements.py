import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# Add useLanguage
if 'useLanguage' not in content:
    content = content.replace('import { cn, formatTeacherName } from "../lib/utils";', 'import { cn, formatTeacherName } from "../lib/utils";\nimport { useLanguage } from "../lib/i18n";')

# Add const { t } = useLanguage();
if 'const { t } = useLanguage();' not in content:
    content = content.replace('const [showCompose, setShowCompose] = useState(false);', 'const [showCompose, setShowCompose] = useState(false);\n  const { t } = useLanguage();')

# Replace texts
content = content.replace('const dynamicFilters = ["All", "Targeted Roles", "Targeted Classes", "Targeted Users", "All Audiences"];', 'const dynamicFilters = ["All", "Targeted Roles", "Targeted Classes", "Targeted Users", "All Audiences"];')
# I need to translate the filter rendering:
# onClick={() => setActiveFilter(filter)}
# ... {filter}
content = content.replace('{filter}', '{t(filter)}')

content = content.replace('canCreate ? "Create and manage broadcast communications." : "Read the latest updates from your school."', 'canCreate ? t("Create and manage broadcast communications.") : t("Read the latest updates from your school.")')
content = content.replace('>Announcements</h1>', '>{t("Announcements")}</h1>')
content = content.replace('New Announcement', '{t("New Announcement")}')
content = content.replace('Search announcements...', 'Search announcements...') # will replace in placeholder
content = content.replace('placeholder="Search announcements..."', 'placeholder={t("Search announcements...")}')
content = content.replace('placeholder="Search announcements"', 'placeholder={t("Search announcements...")}')

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
