with open('src/pages/BuilderReportEditor.tsx', 'r') as f:
    content = f.read()

# Add Sparkles to imports
if 'Sparkles' not in content:
    content = content.replace('RefreshCw, Type } from \'lucide-react\';', 'RefreshCw, Type, Sparkles } from \'lucide-react\';')

# Add isAiLoading state
if 'isAiLoading' not in content:
    content = content.replace("const [loading, setLoading] = useState(false);", "const [loading, setLoading] = useState(false);\n  const [isAiLoading, setIsAiLoading] = useState(false);")

# Add handleAiDesign function before handleSave
ai_func = """
  const handleAiDesign = () => {
      setIsAiLoading(true);
      setTimeout(() => {
          const suggestions: Record<string, any> = {
              'users': {
                  title: 'Comprehensive User Directory',
                  desc: 'A complete overview of all registered system users.',
                  header: 'User Directory Report',
                  footer: 'System Auto-Generated • AI Verified',
                  cols: ['first_name', 'last_name', 'email', 'role', 'status', 'created_at']
              },
              'credentials': {
                  title: 'System Access Credentials',
                  desc: 'Security report detailing user access rights and credential status.',
                  header: 'Security Credentials Report',
                  footer: 'Confidential • Internal Security Only',
                  cols: ['user_name', 'email', 'role', 'password_hash']
              },
              'classes': {
                  title: 'Academic Classes Roster',
                  desc: 'Current academic classes and associated primary assignments.',
                  header: 'Classes Roster',
                  footer: 'Academic Dept • Internal',
                  cols: ['class_name', 'description', 'status', 'capacity']
              },
              'enrollments': {
                  title: 'Student Enrollment Status',
                  desc: 'Current student enrollments across all active programs.',
                  header: 'Enrollment Report',
                  footer: 'Registrar Office • Official Record',
                  cols: ['student_id', 'class_id', 'status', 'enrollment_date']
              },
              'programs': {
                  title: 'Active Academic Programs',
                  desc: 'Overview of all academic programs offered.',
                  header: 'Programs Overview',
                  footer: 'Curriculum Planning',
                  cols: ['name', 'description', 'status']
              }
          };

          const defaultSuggestion = {
              title: `${selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1)} Summary`,
              desc: `AI-generated overview of ${selectedTable} data.`,
              header: `Auto-Generated ${selectedTable} Report`,
              footer: 'AI Summary Report',
              cols: availableColumns.slice(0, 5)
          };

          const chosen = suggestions[selectedTable] || defaultSuggestion;
          
          setReportTitle(chosen.title);
          setReportDescription(chosen.desc);
          setReportHeader(chosen.header);
          setReportFooter(chosen.footer);
          
          const validCols = chosen.cols.filter((c: string) => availableColumns.includes(c));
          if (validCols.length > 0) {
              setSelectedColumns(validCols);
          } else {
              setSelectedColumns(availableColumns.slice(0, 5));
          }
          
          setIsAiLoading(false);
      }, 1200);
  };
"""

if 'const handleAiDesign =' not in content:
    content = content.replace("const handleSave = () => {", ai_func + "\n  const handleSave = () => {")

# Add AI button to the header UI
ai_button = """
           <button 
              onClick={handleAiDesign}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-secondary font-label font-bold text-sm hover:bg-secondary-container/80 transition-colors shadow-sm disabled:opacity-70"
           >
              {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiLoading ? "Designing..." : "AI Auto-Design"}
           </button>"""

if 'AI Auto-Design' not in content:
    content = content.replace('<button \n              onClick={runPreview}', ai_button + '\n           <button \n              onClick={runPreview}')

with open('src/pages/BuilderReportEditor.tsx', 'w') as f:
    f.write(content)
