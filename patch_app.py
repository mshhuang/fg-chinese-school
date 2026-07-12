import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_stmt = "import BuilderReportEditor from './pages/BuilderReportEditor';"
if import_stmt not in content:
    content = content.replace("import BuilderDashboard from './pages/BuilderDashboard';", "import BuilderDashboard from './pages/BuilderDashboard';\n" + import_stmt)

route_stmt = '<Route path="/builder/report-editor" element={<BuilderReportEditor />} />'
if route_stmt not in content:
    content = content.replace('<Route path="/builder/dashboard" element={<BuilderDashboard />} />', '<Route path="/builder/dashboard" element={<BuilderDashboard />} />\n           ' + route_stmt)

with open('src/App.tsx', 'w') as f:
    f.write(content)
