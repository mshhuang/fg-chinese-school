with open('src/pages/VolunteerDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace("               Operations\n            </h2>", "               {t('Operations')}\n            </h2>")
text = text.replace("               Quick Actions\n            </h2>", "               {t('Quick Actions')}\n            </h2>")

with open('src/pages/VolunteerDashboard.tsx', 'w') as f:
    f.write(text)
