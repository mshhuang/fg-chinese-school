with open('src/components/layout/MainLayout.tsx', 'r') as f:
    text = f.read()

text = text.replace('{roleInfo.roleLabel}', '{t(roleInfo.roleLabel)}')
text = text.replace('{currentRole.roleLabel}', '{t(currentRole.roleLabel)}')
text = text.replace('>Switch Role View<', '>{t("Switch Role View")}<')
text = text.replace('>Switch Role<', '>{t("Switch Role")}<')

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(text)
