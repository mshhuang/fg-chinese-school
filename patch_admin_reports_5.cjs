const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');

const targetStr = `  async function fetchStudentLogins() {
     setStudentLoginsLoading(true);
     const [sYear, sMonth, sDay] = studentLoginsStartDate.split('-').map(Number);
     const startOfDay = new Date(sYear, sMonth - 1, sDay);
     startOfDay.setHours(0, 0, 0, 0);
     
     const [eYear, eMonth, eDay] = studentLoginsEndDate.split('-').map(Number);
     const endOfDay = new Date(eYear, eMonth - 1, eDay);
     endOfDay.setHours(23, 59, 59, 999);
     
     try {
       const { data: logsData, error: logsError } = await supabase
         .from('system_logs')
         .select('user_id, user_name, created_at, activity')
         .eq('action_type', 'login')
         .ilike('user_role', 'student')
         .gte('created_at', startOfDay.toISOString())
         .lte('created_at', endOfDay.toISOString())
         .not('activity', 'ilike', '%Failed%')
         .order('created_at', { ascending: false });

       if (logsError) throw logsError;

       const { data: enrollsData, error: enrollsError } = await supabase
         .from('enrollments')
         .select('student_id, classes(class_name)');

       if (enrollsError) throw enrollsError;

       const classGroups: Record<string, any[]> = {};
       
       logsData?.forEach(log => {
         const studentEnrolls = enrollsData?.filter(e => e.student_id === log.user_id) || [];
         let classNames = studentEnrolls.map(e => e.classes?.class_name).filter(Boolean);
         if (classNames.length === 0) classNames = ['Unassigned'];

         classNames.forEach(cName => {
           if (!classGroups[cName]) {
             classGroups[cName] = [];
           }
           const existing = classGroups[cName].find(s => s.user_id === log.user_id);
           if (existing) {
             existing.login_count = (existing.login_count || 1) + 1;
           } else {
             classGroups[cName].push({
               user_id: log.user_id,
               user_name: log.user_name,
               last_login: log.created_at,
               login_count: 1
             });
           }
         });
       });
       
       const groupedArray = Object.keys(classGroups).map(className => ({
         class_name: className,
         students: classGroups[className]
       })).sort((a, b) => a.class_name.localeCompare(b.class_name));
       
       setStudentLoginsData(groupedArray);
     } catch (err) {
       console.error("Error fetching student logins:", err);
     } finally {
       setStudentLoginsLoading(false);
     }
  }`;

const replaceStr = `  async function fetchStudentLogins() {
     setStudentLoginsLoading(true);
     
     try {
       const { data: visitData, error: visitError } = await supabase
         .from('page_visit_report')
         .select('*')
         .eq('user_role', 'student')
         .gte('visit_date', studentLoginsStartDate)
         .lte('visit_date', studentLoginsEndDate);

       if (visitError) throw visitError;
       
       const { data: usersData, error: usersError } = await supabase
         .from('users')
         .select('user_id, first_name, last_name, user_name');

       if (usersError) throw usersError;

       const { data: enrollsData, error: enrollsError } = await supabase
         .from('enrollments')
         .select('student_id, classes(class_name)');

       if (enrollsError) throw enrollsError;

       const classGroups: Record<string, any[]> = {};
       
       const matchUser = (name: string) => {
         return usersData?.find(u => {
           if (\`\${u.first_name} \${u.last_name}\` === name) return true;
           const normName = name.replace(/\\s+/g, ' ').trim().toLowerCase();
           const normU = \`\${u.first_name || ''} \${u.last_name || ''}\`.replace(/\\s+/g, ' ').trim().toLowerCase();
           return normName === normU;
         });
       };

       visitData?.forEach(visit => {
         const user = matchUser(visit.user_name);
         const studentId = user ? user.user_id : null;
         
         const studentEnrolls = enrollsData?.filter(e => e.student_id === studentId) || [];
         let classNames = studentEnrolls.map(e => e.classes?.class_name).filter(Boolean);
         if (classNames.length === 0) classNames = ['Unassigned'];

         classNames.forEach(cName => {
           if (!classGroups[cName]) {
             classGroups[cName] = [];
           }
           // Use name as identifier if ID is missing
           const idToMatch = studentId || visit.user_name;
           const existing = classGroups[cName].find(s => (s.user_id || s.user_name) === idToMatch);
           
           const visitDateTime = new Date(\`\${visit.visit_date}T\${visit.visit_time}\`);
           
           if (existing) {
             existing.login_count = (existing.login_count || 1) + 1;
             const existingDate = new Date(existing.last_login);
             if (visitDateTime > existingDate) {
                 existing.last_login = visitDateTime.toISOString();
             }
           } else {
             classGroups[cName].push({
               user_id: studentId,
               user_name: visit.user_name,
               last_login: visitDateTime.toISOString(),
               login_count: 1
             });
           }
         });
       });
       
       const groupedArray = Object.keys(classGroups).map(className => ({
         class_name: className,
         students: classGroups[className]
       })).sort((a, b) => a.class_name.localeCompare(b.class_name));
       
       setStudentLoginsData(groupedArray);
     } catch (err) {
       console.error("Error fetching student visits:", err);
     } finally {
       setStudentLoginsLoading(false);
     }
  }`;

code = code.replace(targetStr, replaceStr);

const buttonTarget = `<button
          onClick={() => setActiveTab('student_logins')}
          className={\`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \${
            activeTab === 'student_logins' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }\`}
        >
          <Users className="w-4 h-4" /> Student Logins
        </button>`;

const buttonReplace = `<button
          onClick={() => setActiveTab('student_logins')}
          className={\`flex items-center gap-2 px-6 py-2.5 rounded-xl font-label font-bold text-sm transition-all \${
            activeTab === 'student_logins' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }\`}
        >
          <Users className="w-4 h-4" /> Student Activity (Visits)
        </button>`;

code = code.replace(buttonTarget, buttonReplace);

const headingTarget = `<h2 className="font-display text-2xl font-bold text-on-surface">Student Logins</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{studentLoginsStartDate} to {studentLoginsEndDate}</span>
                   </div>
                   <p className="text-on-surface-variant">View which students have logged in grouped by their assigned classes.</p>`;

const headingReplace = `<h2 className="font-display text-2xl font-bold text-on-surface">Student Activity (Visits)</h2>
                       <span className="font-mono text-sm text-on-surface-variant">{studentLoginsStartDate} to {studentLoginsEndDate}</span>
                   </div>
                   <p className="text-on-surface-variant">View student page visits grouped by their assigned classes.</p>`;

code = code.replace(headingTarget, headingReplace);

const tableHeadTarget = `<th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant">Student Name</th>
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant">Last Login</th>
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant text-right">Total Logins</th>`;

const tableHeadReplace = `<th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant">Student Name</th>
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant">Last Visit</th>
                                 <th className="py-3 px-6 font-label font-bold text-sm text-on-surface-variant text-right">Total Page Visits</th>`;

code = code.replace(tableHeadTarget, tableHeadReplace);

fs.writeFileSync('src/pages/AdminReports.tsx', code);
console.log("Patched to use page_visit_report view");
