with open('src/pages/StaffDashboard.tsx', 'r') as f:
    text = f.read()

btn1 = """               <button onClick={() => {}} className="flex flex-col items-start gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 transition-all text-left opacity-50 grayscale pointer-events-none cursor-not-allowed">
                  <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
                     <ClipboardEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-title text-lg font-bold text-on-surface">Daily Attendance</h4>
                    <p className="font-body text-sm text-on-surface-variant mt-1">Submit student headcount and reports</p>
                  </div>
               </button>"""

text = text.replace(btn1, "")

with open('src/pages/StaffDashboard.tsx', 'w') as f:
    f.write(text)

with open('src/pages/VolunteerDashboard.tsx', 'r') as f:
    text2 = f.read()

btn2 = """               <button onClick={() => {}} className="flex flex-col items-start gap-4 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 transition-all text-left opacity-50 grayscale pointer-events-none cursor-not-allowed">
                  <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
                     <ClipboardEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-title text-lg font-bold text-on-surface">{t('Daily Attendance')}</h4>
                    <p className="font-body text-sm text-on-surface-variant mt-1">{t('Submit student headcount and reports')}</p>
                  </div>
               </button>"""

text2 = text2.replace(btn2, "")

with open('src/pages/VolunteerDashboard.tsx', 'w') as f:
    f.write(text2)
