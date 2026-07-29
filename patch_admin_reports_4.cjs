const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');

// Insert the button
const buttonTarget = `        <button
          onClick={() => setActiveTab('login_history')}
          className={\`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \${
            activeTab === 'login_history' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }\`}
        >
          <Clock className="w-4 h-4" /> Login History
        </button>`;

const buttonReplace = `        <button
          onClick={() => setActiveTab('login_history')}
          className={\`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \${
            activeTab === 'login_history' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }\`}
        >
          <Clock className="w-4 h-4" /> Login History
        </button>
        <button
          onClick={() => setActiveTab('student_logins')}
          className={\`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \${
            activeTab === 'student_logins' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }\`}
        >
          <Users className="w-4 h-4" /> Student Logins
        </button>`;
code = code.replace(buttonTarget, buttonReplace);

// Insert the content section
const contentTarget = `            {activeTab === 'login_history' && (`;
const contentReplace = `            {activeTab === 'student_logins' && (
              <div>
                <ReportPrintHeader title="STUDENT LOGINS BY CLASS" />
                <div className="flex flex-col gap-2 mb-6 print:hidden">
                   <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
                       <h2 className="font-display text-2xl font-bold text-on-surface">Student Logins</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{studentLoginsStartDate} to {studentLoginsEndDate}</span>
                   </div>
                   <p className="text-on-surface-variant">View which students have logged in grouped by their assigned classes.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6 print:hidden">
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">Start Date</label>
                     <input 
                       type="date" 
                       value={studentLoginsStartDate}
                       onChange={e => setStudentLoginsStartDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="font-label text-sm font-bold text-on-surface-variant">End Date</label>
                     <input 
                       type="date" 
                       value={studentLoginsEndDate}
                       onChange={e => setStudentLoginsEndDate(e.target.value)}
                       className="px-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-body bg-surface text-on-surface"
                     />
                   </div>
                </div>

                {studentLoginsLoading ? (
                   <div className="py-12 text-center text-on-surface-variant">
                     <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     Loading data...
                   </div>
                ) : studentLoginsData.length === 0 ? (
                   <div className="py-12 text-center text-on-surface-variant font-medium bg-surface rounded-2xl border border-outline-variant/30">
                     No student logins found in this date range.
                   </div>
                ) : (
                   <div className="flex flex-col gap-8">
                     {studentLoginsData.map((group, idx) => (
                       <div key={idx} className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
                         <div className="px-6 py-4 bg-surface-container-lowest border-b border-outline-variant/30 flex justify-between items-center">
                           <h3 className="font-label font-bold text-lg text-primary">{group.class_name}</h3>
                           <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
                             {group.students.length} Student{group.students.length !== 1 ? 's' : ''}
                           </span>
                         </div>
                         <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                             <thead>
                               <tr className="border-b border-outline-variant/20">
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant">Student Name</th>
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant">Last Login</th>
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant text-right">Total Logins</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-outline-variant/10">
                               {group.students.map((student: any) => (
                                 <tr key={student.user_id} className="hover:bg-surface-variant/10 transition-colors">
                                   <td className="py-3 px-6 text-on-surface font-medium">{student.user_name}</td>
                                   <td className="py-3 px-6 text-on-surface-variant font-body text-sm">
                                     {new Date(student.last_login).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                                   </td>
                                   <td className="py-3 px-6 text-on-surface-variant font-body text-sm text-right">
                                     {student.login_count}
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            )}
            
            {activeTab === 'login_history' && (`;
code = code.replace(contentTarget, contentReplace);

fs.writeFileSync('src/pages/AdminReports.tsx', code);
console.log("Patched UI");
