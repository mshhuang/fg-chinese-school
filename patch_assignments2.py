with open('src/pages/StudentAssignments.tsx', 'r') as f:
    text = f.read()

text = text.replace("            All Assignments", "            {t('All Assignments')}")
text = text.replace("            To Do", "            {t('To Do')}")
text = text.replace("            Completed", "            {t('Completed')}")

with open('src/pages/StudentAssignments.tsx', 'w') as f:
    f.write(text)
