import re

with open('src/pages/AdminReports.tsx', 'r') as f:
    content = f.read()

target_ui = """                        {activeTab === 'credentials' && (
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
                         const role = isTeacher ? 'Teacher' : isStudent ? 'Student' : isVolunteer ? 'Volunteer' : 'Staff / Other';
                         
                         return (
                           <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                             <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{role}</td>
                             <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                               {user.password_hash ? 'Set (Encrypted)' : 'Not Set'}
                             </td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}"""

replacement_ui = """                        {activeTab === 'credentials' && (
              <div>
                <ReportPrintHeader title="User Credentials Report" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">User Credentials by Class</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{new Date().toLocaleDateString()}</span>
                   </div>
                   <p className="text-on-surface-variant">A report displaying all users and their usernames grouped by class and teacher. Passwords are encrypted for security.</p>
                </div>
                
                <div className="space-y-8">
                  {classes.map(cls => {
                    const classEnrollments = enrollments.filter(e => String(e.class_id) === String(cls.class_id) && e.status === 'Active');
                    const classStudents = students.filter(s => classEnrollments.some(e => e.student_id === s.user_id));
                    
                    if (classStudents.length === 0) return null;
                    
                    const primaryTeacher = teachers.find(t => t.user_id === cls.primary_teacher_id);
                    const coTeacher = teachers.find(t => t.user_id === cls.co_teacher_id);
                    
                    return (
                      <div key={cls.class_id} className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                        <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                          <h3 className="font-display text-lg font-bold text-on-surface">{cls.class_name}</h3>
                          <p className="text-sm text-on-surface-variant font-body mt-1">
                            Teacher: <span className="font-medium text-on-surface">{primaryTeacher ? `${primaryTeacher.first_name} ${primaryTeacher.last_name}` : 'Unassigned'}</span>
                            {coTeacher && <span> | Co-Teacher: <span className="font-medium text-on-surface">{coTeacher.first_name} {coTeacher.last_name}</span></span>}
                          </p>
                        </div>
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                            <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                              <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Student Name</th>
                              <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                              <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classStudents.map((user, idx) => (
                              <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                                <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                                <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                                <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                                  {user.password_hash ? 'Set (Encrypted)' : 'Not Set'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                  
                  {/* Unassigned Users / Staff Section */}
                  <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant/30 shadow-sm bg-surface print:break-inside-avoid">
                    <div className="bg-surface-container-low p-4 border-b border-outline-variant/30">
                      <h3 className="font-display text-lg font-bold text-on-surface">Staff & Other Users</h3>
                      <p className="text-sm text-on-surface-variant font-body mt-1">Teachers, Volunteers, and Administrators</p>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-lowest print:bg-transparent print:border-t print:border-black/20">
                        <tr className="border-b border-outline-variant/50 print:border-b-black/20">
                          <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                          <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Username</th>
                          <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Role</th>
                          <th className="py-3 px-4 font-label font-bold text-sm text-on-surface-variant uppercase tracking-wider">Password Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.filter(u => {
                          const isStudent = students.some(s => s.user_id === u.user_id);
                          return !isStudent;
                        }).map((user, idx) => {
                           const isTeacher = teachers.some(t => t.user_id === user.user_id);
                           const isVolunteer = volunteers.some(v => v.user_id === user.user_id);
                           const role = isTeacher ? 'Teacher' : isVolunteer ? 'Volunteer' : 'Staff / Other';
                           
                           return (
                             <tr key={user.user_id || idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/30 print:border-b-black/20 print:break-inside-avoid">
                               <td className="py-3 px-4 font-body text-sm font-medium text-on-surface">{user.first_name} {user.last_name}</td>
                               <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{user.user_name || '-'}</td>
                               <td className="py-3 px-4 font-body text-sm text-on-surface-variant">{role}</td>
                               <td className="py-3 px-4 font-body text-sm text-on-surface-variant">
                                 {user.password_hash ? 'Set (Encrypted)' : 'Not Set'}
                               </td>
                             </tr>
                           );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}"""

content = content.replace(target_ui, replacement_ui)

with open('src/pages/AdminReports.tsx', 'w') as f:
    f.write(content)
print("AdminReports credentials section patched!")
