with open('src/pages/VolunteerDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("? 'Clock Out' : 'Clock In'", '? t("Clock Out") : t("Clock In")')
content = content.replace(">QR Scanner<", ">{t('QR Scanner')}<")

with open('src/pages/VolunteerDashboard.tsx', 'w') as f:
    f.write(content)

with open('src/pages/StaffDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(">QR Scanner<", ">{t('QR Scanner')}<")
content = content.replace("? 'Clock Out' : 'Clock In'", '? t("Clock Out") : t("Clock In")')

with open('src/pages/StaffDashboard.tsx', 'w') as f:
    f.write(content)
