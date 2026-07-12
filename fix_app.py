with open('src/App.tsx', 'r') as f:
    content = f.read()

import_str = "import BuilderReportEditor from './pages/BuilderReportEditor';\n"
if "import BuilderDashboard" in content:
    content = content.replace("import BuilderDashboard", import_str + "import BuilderDashboard")

with open('src/App.tsx', 'w') as f:
    f.write(content)
