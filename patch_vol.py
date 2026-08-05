with open('src/pages/VolunteerDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace(">Volunteer Portal</h1>", ">{t('Volunteer Portal')}</h1>")
text = text.replace(">View your upcoming shifts, events, and manage daily operations.</p>", ">{t('View your upcoming shifts, events, and manage daily operations.')}</p>")
text = text.replace(">Operations</h2>", ">{t('Operations')}</h2>")
text = text.replace(">Scan student or staff ID badges</p>", ">{t('Scan student or staff ID badges')}</p>")
text = text.replace(">Daily Attendance</h4>", ">{t('Daily Attendance')}</h4>")
text = text.replace(">Submit student headcount and reports</p>", ">{t('Submit student headcount and reports')}</p>")
text = text.replace(">Quick Actions</h2>", ">{t('Quick Actions')}</h2>")
text = text.replace(">Contact staff and teachers</p>", ">{t('Contact staff and teachers')}</p>")
text = text.replace(">View Announcements</h4>", ">{t('View Announcements')}</h4>")
text = text.replace(">Stay updated with school news</p>", ">{t('Stay updated with school news')}</p>")

if 'import { useLanguage } from "../lib/i18n"' not in text:
    text = text.replace('import React', 'import { useLanguage } from "../lib/i18n";\nimport React')
if 'const { t } = useLanguage();' not in text:
    text = text.replace('export default function VolunteerDashboard() {', 'export default function VolunteerDashboard() {\n  const { t } = useLanguage();')

with open('src/pages/VolunteerDashboard.tsx', 'w') as f:
    f.write(text)
