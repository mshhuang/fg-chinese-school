import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    text = f.read()

# For teacher
text = text.replace('{ icon: ClipboardEdit, label: "Roster & Attendance", href: "/teacher/attendance" },', '')
# For staff
text = text.replace('{ icon: FileText, label: "Attendance", href: "/staff/attendance", disabled: true },', '')
# For volunteer
text = text.replace('{ icon: FileText, label: "Attendance", href: "/volunteer/attendance", disabled: true },', '')

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(text)

with open('src/pages/AdminReports.tsx', 'r') as f:
    text2 = f.read()

text2 = text2.replace("""          <button
            onClick={() => setActiveTab('attendance')}
            className={cn(
              "px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2",
              activeTab === 'attendance' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <CheckSquare className="w-4 h-4" /> Attendance
          </button>""", "")

text2 = text2.replace("""          <button
            onClick={() => setActiveTab('staff_attendance')}
            className={cn(
              "px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2",
              activeTab === 'staff_attendance' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            <Clock className="w-4 h-4" /> Staff Attendance
          </button>""", "")

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(text2)
