with open('src/lib/i18n.tsx', 'r') as f:
    text = f.read()

# I added Switch Role near the top in my previous patch_i18n7.py.
# Let's remove the one I added (the duplicate).
text = text.replace('  "Switch Role": { en: "Switch Role", \'zh-CN\': "切换角色", \'zh-TW\': "切換角色" },\n', '', 1)

with open('src/lib/i18n.tsx', 'w') as f:
    f.write(text)
