const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function generateReport() {
    const { data: visitData, error: visitError } = await sb
        .from('page_visit_report')
        .select('*')
        .eq('user_role', 'student');
        
    const { data: usersData, error: usersError } = await sb
        .from('users')
        .select('user_id, first_name, last_name, user_name');

    const { data: enrollsData, error: enrollsError } = await sb
        .from('enrollments')
        .select('student_id, classes(class_name)');

    const classGroups = {};
       
    const matchUser = (name) => {
        return usersData?.find(u => {
            if (`${u.first_name} ${u.last_name}` === name) return true;
            const normName = name.replace(/\s+/g, ' ').trim().toLowerCase();
            const normU = `${u.first_name || ''} ${u.last_name || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
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
            const idToMatch = studentId || visit.user_name;
            const existing = classGroups[cName].find(s => (s.user_id || s.user_name) === idToMatch);
            
            const visitDateTime = new Date(`${visit.visit_date}T${visit.visit_time}`);
            
            if (existing) {
                existing.login_count += 1;
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
    
    let report = "## Student Login / Activity Report by Class\n\n";
    
    Object.keys(classGroups).sort().forEach(className => {
        report += `### ${className}\n`;
        const students = classGroups[className];
        students.sort((a, b) => a.user_name.localeCompare(b.user_name));
        students.forEach(s => {
            const date = new Date(s.last_login).toLocaleString('en-US', { timeZone: 'America/New_York' });
            report += `- **${s.user_name}**: ${s.login_count} visits (Last active: ${date})\n`;
        });
        report += "\n";
    });
    
    console.log(report);
}
generateReport();
