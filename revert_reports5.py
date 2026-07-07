import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

idx_start = content.find("            {activeTab === 'credentials' && (")
if idx_start != -1:
    # Find the end of the file or the end of the credentials block
    # We will just split it up using regex since the ending might have slightly different spacing.
    content_regex = re.compile(r"\s*\{activeTab === 'credentials' && \(\s*<div>.*?</div>\s*\)\s*\}\s*</div>\s*\)\s*\}\s*</div>\s*</div>\s*\);\s*\}\s*$", re.DOTALL)
    content = re.sub(content_regex, '\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}\n', content)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("done")
