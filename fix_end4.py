import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

pattern = r"</button>\s*</div>\s*</div>\s*</aside>\s*</div>\s*</div>\s*\);\s*}"

replacement = """</button>
               </div>
            </div>
         </aside>
       </div>
    </div>
  </div>
  );
}"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
