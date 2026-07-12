import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

content = content.replace('''      try {
      const res = await fetch(url, options);
            
      try {''', '''      try {''')

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
