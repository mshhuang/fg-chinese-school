with open('src/components/InternalMessagesPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('? "{t("Search for users above to start a new conversation.")}"', '? t("Search for users above to start a new conversation.")')
content = content.replace(': "No users matched your search."}', ': t("No users matched your search.")}')

with open('src/components/InternalMessagesPanel.tsx', 'w') as f:
    f.write(content)
