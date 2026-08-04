with open('src/components/InternalMessagesPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('>Choose a user...<', '>{t("Choose a user...")}<')

with open('src/components/InternalMessagesPanel.tsx', 'w') as f:
    f.write(content)
