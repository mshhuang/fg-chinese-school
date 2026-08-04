import re

with open('src/lib/i18n.tsx', 'r') as f:
    content = f.read()

# I will just rely on the object literal taking the last key for now, or just use regex to remove duplicates.
# Actually let's just parse the file to a dictionary if we could, but it's JS.
# Let's just remove the ones I just added that are duplicates.
