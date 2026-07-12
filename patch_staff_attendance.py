import re

with open('src/pages/StaffAttendance.tsx', 'r') as f:
    content = f.read()

pattern = r"""    if \(toInsert\.length > 0\) \{\n       await supabase\.from\('attendance'\)\.insert\(toInsert\);\n    \}"""
replacement = """    if (toInsert.length > 0) {
       await supabase.from('attendance').insert(toInsert);
       
       // Sync to student_clock_ins
       const todayStart = new Date();
       todayStart.setHours(0,0,0,0);
       
       const clockInsToInsert = [];
       const logsToInsert = [];
       
       for (const item of toInsert) {
           let actionType = 'school_check_in';
           let dailyStatus = 'check-in the building';
           
           if (item.status === 'Late') {
               actionType = 'school_check_in_late';
           } else if (item.status === 'Absent' || item.status === 'Excused') {
               actionType = 'school_absent';
               dailyStatus = 'not arrive yet';
           }
           
           clockInsToInsert.push({
               student_id: item.student_id,
               action_type: actionType,
               daily_status: dailyStatus
           });
           
           logsToInsert.push({
               user_id: item.student_id,
               action_type: actionType,
               activity: `Teacher marked attendance: ${item.status}`,
               page_name: 'Attendance Sheet',
               data_changed: { time: new Date().toISOString(), class_id: item.class_id }
           });
       }
       
       if (clockInsToInsert.length > 0) {
           await supabase.from('student_clock_ins').insert(clockInsToInsert);
           await supabase.from('system_logs').insert(logsToInsert);
       }
    }"""
content = re.sub(pattern, replacement, content)

with open('src/pages/StaffAttendance.tsx', 'w') as f:
    f.write(content)
