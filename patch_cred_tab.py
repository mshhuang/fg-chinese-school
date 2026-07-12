import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

target_ui = """            {activeTab === 'credentials' && (
              <div>
                <ReportPrintHeader title="User Credentials Report" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">User Credentials</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{new Date().toLocaleDateString()}</span>
                   </div>
                   <p className="text-on-surface-variant">A report displaying all users and their usernames. Passwords are encrypted for security.</p>
                </div>
                
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Role</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((user, idx) => {
                         const isTeacher = teachers.some(t => t.user_id === user.user_id);
                         const isStudent = students.some(s => s.user_id === user.user_id);
                         const isVolunteer = volunteers.some(v => v.user_id === user.user_id);
                         const role = isTeacher ? 'Teacher' : isStudent ? 'Volunteer' : 'Staff / Other';
                         // wait, need to make sure my regex or exact match is correct. I'll just use sed or regex string replacement.
"""
