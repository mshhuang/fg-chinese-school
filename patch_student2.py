with open('src/pages/StudentPortal.tsx', 'r') as f:
    text = f.read()

text = text.replace("Today's Path", "{t(\"Today's Assignment\")}")
text = text.replace("{assignments.length} Tasks Left", "{assignments.length} {t('Tasks Left')}")
text = text.replace(">Achievements<", ">{t('Achievements')}<")
text = text.replace("{programDays} Days", "{programDays} {t('Days')}")
text = text.replace("{prog.days} Days", "{prog.days} {t('Days')}")

with open('src/pages/StudentPortal.tsx', 'w') as f:
    f.write(text)
