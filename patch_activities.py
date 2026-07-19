with open('src/pages/Activities.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if line.startswith('  const fetchLogs = async () => {'):
        skip = True
        new_lines.append('''  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLogs([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
''')
    if skip and line.startswith('  };') and i < 75:
        skip = False
        continue
    if not skip:
        new_lines.append(line)

with open('src/pages/Activities.tsx', 'w') as f:
    f.writelines(new_lines)

print("Patched Activities.tsx")
