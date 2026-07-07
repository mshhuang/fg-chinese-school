import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

idx_start = content.find("            {activeTab === 'credentials' && (")
if idx_start != -1:
    # Find the end of the div. We'll search for the next closing brace or div, but since it's the last one, let's just find the closing tags of the credentials block.
    # It ends right before "          </div>\n        )\n      </div>\n    </div>"
    idx_end = content.find("          </div>\n        )\n      </div>\n    </div>", idx_start)
    if idx_end != -1:
        content = content[:idx_start] + content[idx_end:]

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("done")
