with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

content = content.replace('> Cancel<', '> {t("Cancel")}<')
content = content.replace('>Save Changes<', '>{t("Save Changes")}<')

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
