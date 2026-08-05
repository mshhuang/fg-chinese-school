with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    text = f.read()

replacements = [
    ('placeholder="e.g. March Updates"', 'placeholder={t("e.g. March Updates")}'),
    ('placeholder="e.g. All Parents"', 'placeholder={t("e.g. All Parents")}'),
    ('placeholder="Provide a short summary..."', 'placeholder={t("Provide a short summary...")}')
]

for old, new in replacements:
    text = text.replace(old, new)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(text)
