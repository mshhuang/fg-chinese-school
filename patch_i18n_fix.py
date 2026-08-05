with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

# I added View All previously. Let's find out how many times it exists.
# We'll just remove the one I added if it was a duplicate, but wait, the duplicate might just be overwritten, it's a TS error in object literal.
text = text.replace('  "View All": { en: "View All", \'zh-CN\': "查看全部", \'zh-TW\': "查看全部" },\n', '', 1)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
