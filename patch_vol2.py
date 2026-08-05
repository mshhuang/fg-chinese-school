with open('src/pages/VolunteerDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("            View your upcoming shifts, events, and manage daily operations.", "            {t('View your upcoming shifts, events, and manage daily operations.')}")

with open('src/pages/VolunteerDashboard.tsx', 'w') as f:
    f.write(text)
