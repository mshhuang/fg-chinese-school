const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');

const targetStr = `  async function fetchLoginLogs() {`;
const replaceStr = `  async function fetchStudentLogins() {
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
  }

  async function fetchLoginLogs() {`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/pages/AdminReports.tsx', code);
console.log("Patched fetchStudentLogins");
