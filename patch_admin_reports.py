import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    text = f.read()

btn1 = r"""        <button
          onClick=\{\(\) => setActiveTab\('attendance'\)\}
          className=\{`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \$\{
            activeTab === 'attendance' \? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          \}`\}
        >
          <CheckSquare className="w-4 h-4" /> Attendance
        </button>"""

btn2 = r"""        <button
          onClick=\{\(\) => setActiveTab\('staff_attendance'\)\}
          className=\{`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \$\{
            activeTab === 'staff_attendance' \? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          \}`\}
        >
          <Clock className="w-4 h-4" /> Staff Attendance
        </button>"""

text = re.sub(btn1, '', text)
text = re.sub(btn2, '', text)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(text)
