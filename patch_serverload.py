import re

# File 1: Diagnostics.tsx
with open('src/pages/Diagnostics.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'  const \[serverLoad, setServerLoad\] = useState<string>\("24%"\);\n', '', content)
content = re.sub(r'    // Simulate real server load\n    const loadInterval = setInterval\(\(\) => \{\n        setServerLoad\(`\$\{Math.floor\(Math.random\(\) \* 15\) \+ 15\}%`\);\n    \}, 5000\);\n\n    return \(\) => clearInterval\(loadInterval\);\n', '', content)
content = re.sub(r'         <MetricCard title="Server Load" value=\{serverLoad\} change="Live monitoring" icon=\{Server\} trend="neutral" />\n', '', content)
content = re.sub(r'lg:grid-cols-4', 'lg:grid-cols-3', content) # Change grid columns if it exists in Diagnostics

with open('src/pages/Diagnostics.tsx', 'w') as f:
    f.write(content)

# File 2: BuilderDashboard.tsx
with open('src/pages/BuilderDashboard.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'  const \[serverLoad, setServerLoad\] = useState<string>\("24%"\);\n', '', content)
content = re.sub(r'    // Simulate real server load\n    const loadInterval = setInterval\(\(\) => \{\n        setServerLoad\(`\$\{Math.floor\(Math.random\(\) \* 15\) \+ 15\}%`\);\n    \}, 5000\);\n\n    return \(\) => clearInterval\(loadInterval\);\n', '', content)

# Remove the block for Server Load KPI
kpi_block = r'''          \{\/\* Server Load KPI \*\/\}
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant\/30 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-secondary-container text-secondary rounded-xl flex items-center justify-center shrink-0">
                 <Server className="w-6 h-6" \/>
             <\/div>
             <div>
                <p className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Server Load<\/p>
                <div className="flex items-center gap-2">
                   <h2 className="font-title text-3xl font-bold text-on-surface">\{serverLoad\}<\/h2>
                <\/div>
             <\/div>
          <\/div>\n'''

content = re.sub(kpi_block, '', content)
content = re.sub(r'lg:grid-cols-4', 'lg:grid-cols-3', content)

with open('src/pages/BuilderDashboard.tsx', 'w') as f:
    f.write(content)

print("Patched both files.")
