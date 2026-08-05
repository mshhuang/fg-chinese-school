with open('src/pages/MyLessonPlans.tsx', 'r') as f:
    text = f.read()

text = text.replace('{savedUrl ? "Google File" : "No file linked yet."}', '{savedUrl ? t("Google File") : t("No file linked yet.")}')

with open('src/pages/MyLessonPlans.tsx', 'w') as f:
    f.write(text)
