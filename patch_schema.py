with open('supabase_schema_updates.sql', 'r') as f:
    content = f.read()

print("Schema file size:", len(content))
