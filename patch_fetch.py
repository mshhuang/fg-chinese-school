import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content

    # Replace fetchLogs bodies to just return empty arrays or fake data instead of hitting supabase
    if 'Activities.tsx' in filepath:
        content = re.sub(
            r'const fetchLogs = async \(\) => \{.*?try \{.*?const \{ data, error: fetchError \} = await supabase.*?setLogs\(data\);.*?\} catch \(err: any\) \{.*?\}',
            r'''const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mocking to stop fetching data from supabase
      setLogs([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };''',
            content,
            flags=re.DOTALL
        )
    if 'LiveErrorLogs.tsx' in filepath:
        content = re.sub(
            r'async function fetchLogs\(\) \{.*?setLoading\(true\);.*?const \{ data, error \} = await supabase.*?setLogs\(data\);.*?\}',
            r'''async function fetchLogs() {
    setLoading(true);
    try {
       // Mocking to stop fetching data from supabase
       setLogs([]);
    } catch(e) {}
    setLoading(false);
  }''',
            content,
            flags=re.DOTALL
        )
    if 'AuditLogs.tsx' in filepath:
        content = re.sub(
            r'async function fetchLogs\(\) \{.*?setLoading\(true\);.*?const \{ data, error \} = await supabase.*?setLogs\(data\);.*?\}',
            r'''async function fetchLogs() {
    setLoading(true);
    try {
       // Mocking to stop fetching data from supabase
       setLogs([]);
    } catch(e) {}
    setLoading(false);
  }''',
            content,
            flags=re.DOTALL
        )

    if content != orig:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for root, _, files in os.walk('src/pages'):
    for file in files:
        if file in ['Activities.tsx', 'LiveErrorLogs.tsx', 'AuditLogs.tsx']:
            process_file(os.path.join(root, file))
