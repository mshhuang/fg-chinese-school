import re

with open('src/pages/ParentPortal.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"if \(\!emailError && childrenByEmail && childrenByEmail\.length > 0\) \{\s*mappedChildren = childrenByEmail;\s*\}", re.DOTALL)

replacement = """if (!emailError && childrenByEmail && childrenByEmail.length > 0) {
            mappedChildren = childrenByEmail.filter((c: any) => c.user_id !== u.id);
         }"""

if pattern.search(content):
    content = pattern.sub(replacement, content)
    with open('src/pages/ParentPortal.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully.")
else:
    print("Target not found.")

