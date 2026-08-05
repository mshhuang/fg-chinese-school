with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

text = text.replace('"切换角色视图"', '"切换角色"')
text = text.replace('"切換角色視圖"', '"切換角色"')

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
