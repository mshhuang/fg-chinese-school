with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

content = content.replace('Edit Profile', '{t("Edit Profile")}')

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
