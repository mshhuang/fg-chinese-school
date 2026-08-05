with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

text = text.replace('const translations: Translations = {\\n', 'const translations: Translations = {\n')

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
