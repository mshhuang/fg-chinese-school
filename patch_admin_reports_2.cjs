const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminReports.tsx', 'utf8');

const target1 = `const [loginLogsLoading, setLoginLogsLoading] = useState(false);`;
const replace1 = `const [loginLogsLoading, setLoginLogsLoading] = useState(false);
  
  // Student Logins State
  const [studentLoginsStartDate, setStudentLoginsStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  });
  const [studentLoginsEndDate, setStudentLoginsEndDate] = useState(new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }));
  const [studentLoginsData, setStudentLoginsData] = useState<any[]>([]);
  const [studentLoginsLoading, setStudentLoginsLoading] = useState(false);`;

code = code.replace(target1, replace1);

const target2 = `  useEffect(() => {
    if (activeTab === 'login_history') {
       fetchLoginLogs();
    }
  }, [activeTab, loginDate]);`;
const replace2 = `  useEffect(() => {
    if (activeTab === 'login_history') {
       fetchLoginLogs();
    }
  }, [activeTab, loginDate]);

  useEffect(() => {
    if (activeTab === 'student_logins') {
       fetchStudentLogins();
    }
  }, [activeTab, studentLoginsStartDate, studentLoginsEndDate]);`;

code = code.replace(target2, replace2);

fs.writeFileSync('src/pages/AdminReports.tsx', code);
console.log("Patched state and effect");
