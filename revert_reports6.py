with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

idx_start = content.find("            {activeTab === 'credentials' && (")
if idx_start != -1:
    content = content[:idx_start] + "          </div>\n        )}\n      </div>\n    </div>\n  );\n}\n"

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("done")
