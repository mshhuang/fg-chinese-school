import re

with open('src/main.tsx', 'r') as f:
    content = f.read()

if 'import { ErrorDisplay }' not in content:
    content = content.replace("import App from './App.tsx';", "import App from './App.tsx';\nimport { ErrorDisplay } from './ErrorDisplay';")

with open('src/main.tsx', 'w') as f:
    f.write(content)
