with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

content = content.replace('  const [showDemo, setShowDemo] = useState(false);\n', '')

with open('src/pages/Login.tsx', 'w') as f:
    f.write(content)
