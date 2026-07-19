import re
with open('src/pages/BuilderDashboard.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'    // Simulate server load\n    const loadInterval = setInterval\(\(\) => \{\n        setServerLoad\(`\$\{Math.floor\(Math.random\(\) \* 15\) \+ 15\}%`\);\n    \}, 5000\);\n\n    return \(\) => \{\n         \n      clearInterval\(loadInterval\);\n    \};\n', '    return () => {};\n', content)

with open('src/pages/BuilderDashboard.tsx', 'w') as f:
    f.write(content)
