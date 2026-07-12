import re

with open('src/pages/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

pattern = r"No classes assigned yet\.</p>\s*\)\}\s*</div>\s*</div>\s*<div className=\"bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30\">"

replacement = """No classes assigned yet.</p>
                  )}
               </div>
            </div>
          </div>
          
          <aside className="md:col-span-4 flex flex-col gap-8">
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30">"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Now fix the ending tags
end_pattern = r"</button>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\);\s*}"
end_replacement = """</button>
               </div>
            </div>
         </aside>
       </div>
    </div>
  );
}"""
content = re.sub(end_pattern, end_replacement, content, flags=re.DOTALL)

with open('src/pages/TeacherDashboard.tsx', 'w') as f:
    f.write(content)
