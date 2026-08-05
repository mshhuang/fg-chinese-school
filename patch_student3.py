with open('src/pages/StudentPortal.tsx', 'r') as f:
    text = f.read()

text = text.replace(">My Programs<", ">{t('My Programs')}<")
text = text.replace(">View All<", ">{t('View All')}<")

with open('src/pages/StudentPortal.tsx', 'w') as f:
    f.write(text)
