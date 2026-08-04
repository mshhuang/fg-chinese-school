import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

# Import useLanguage
if 'useLanguage' not in content:
    content = content.replace(
        'import { DuplicateClockWarningModal, ExistingClockRecord } from "../components/DuplicateClockWarningModal";',
        'import { DuplicateClockWarningModal, ExistingClockRecord } from "../components/DuplicateClockWarningModal";\nimport { useLanguage } from "../lib/i18n";'
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

content = content.replace('{greeting}, {user?.first_name || "Teacher"}!', '{greeting}, {user?.first_name || "Teacher"}!') # This is fine

content = content.replace('<p className="font-body text-lg text-on-surface-variant mt-2">You have {assignedClasses.filter', '<p className="font-body text-lg text-on-surface-variant mt-2">{t("You have")} {assignedClasses.filter')

# Wait, "You have" isn't in translations. Let's fix the specific text logic.
old_class_counts = '<p className="font-body text-lg text-on-surface-variant mt-2">You have {assignedClasses.filter(c => c.primary_teacher_id === (user?.user_id || user?.id)).length} homeroom classes and {assignedClasses.filter(c => c.primary_teacher_id !== (user?.user_id || user?.id)).length} co-teacher classes.</p>'
new_class_counts = '<p className="font-body text-lg text-on-surface-variant mt-2">{assignedClasses.filter(c => c.primary_teacher_id === (user?.user_id || user?.id)).length} {t("homeroom classes and")} {assignedClasses.filter(c => c.primary_teacher_id !== (user?.user_id || user?.id)).length} {t("co-teacher classes.")}</p>'

content = content.replace(old_class_counts, new_class_counts)

# Button strings
content = content.replace('Check-in QR Code', '{t("Check-in QR Code")}')
content = content.replace('Scan QR', '{t("Scan QR")}')
content = content.replace('My Classes', '{t("My Classes")}')
content = content.replace("Today\\'s Schedule", "{t(\"Today's Schedule\")}")
content = content.replace('Latest Announcement', '{t("Latest Announcement")}')
content = content.replace('Recent Submissions', '{t("Recent Submissions")}')
content = content.replace('Active Clock-In Session Detected', '{t("Active Clock-In Session Detected")}')
content = content.replace('Clock Out Now', '{t("Clock Out Now")}')
content = content.replace('No classes assigned yet.', '{t("No classes assigned yet.")}')

# Replace Clock In / Clock Out text manually carefully
content = re.sub(r'>\s*Clock In\s*<', '>{t("Clock In")}<', content)
content = re.sub(r'>\s*Clock Out\s*<', '>{t("Clock Out")}<', content)
content = re.sub(r'>\s*View All\s*<', '>{t("View All")}<', content)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

