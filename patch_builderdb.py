with open('src/pages/BuilderDatabase.tsx', 'r') as f:
    text = f.read()

text = text.replace('    // Stopped pulling usage from supabase to reduce egress\n    setFetchingUsage(false);', '    if (supabasePat) fetchUsage();\n    // Stopped pulling usage from supabase to reduce egress\n    // setFetchingUsage(false);')

with open('src/pages/BuilderDatabase.tsx', 'w') as f:
    f.write(text)
