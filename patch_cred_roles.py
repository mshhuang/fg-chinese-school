import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

# Define the new credentials block grouped by roles (Students, Teachers, Staff)
new_credentials_block = """            {activeTab === 'credentials' && (
              <div className="space-y-8">
                
                {/* Students Section */}
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                  <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                    <h3 className="font-display text-lg font-bold text-on-surface">Students</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Student Credentials</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((user, idx) => (
                        <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                          <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No students found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Teachers Section */}
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                  <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                    <h3 className="font-display text-lg font-bold text-on-surface">Teachers</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Teacher Credentials</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((user, idx) => (
                        <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                          <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                          <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>
                        </tr>
                      ))}
                      {teachers.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-on-surface-variant">No teachers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Other Users / Staff Section */}
                <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                  <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                    <h3 className="font-display text-lg font-bold text-on-surface">Staff & Other Users</h3>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Volunteers and Administrators</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                      <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Role</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Email</th>
                        <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.filter(u => {
                        const isStudent = students.some(s => s.user_id === u.user_id);
                        const isTeacher = teachers.some(t => t.user_id === u.user_id);
                        return !isStudent && !isTeacher;
                      }).map((user, idx) => {
                         const isVolunteer = volunteers.some(v => v.user_id === user.user_id);
                         const role = isVolunteer ? 'Volunteer' : 'Staff / Other';
                         
                         return (
                           <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{role}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.email || '-'}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.password_hash || 'Not Set'}</td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}"""

# regex to find the activeTab === 'credentials' block
pattern = re.compile(r"\{\s*activeTab === 'credentials' && \(\s*<div className=\"space-y-8\">.*?</div>\s*\)\s*\}", re.DOTALL)

# Let's verify we found it
match = pattern.search(content)
if match:
    new_content = content[:match.start()] + new_credentials_block + content[match.end():]
    with open('src/pages/AdminReports.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully.")
else:
    print("Could not find the credentials block.")
