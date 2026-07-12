import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

replacement = """       setStudents(mapped);
       
       // fetch today's clock in status
       const startOfDay = new Date(targetDate);
       startOfDay.setHours(0,0,0,0);
       const endOfDay = new Date(targetDate);
       endOfDay.setHours(23,59,59,999);
       
       const { data: clockInData } = await supabase.from('student_clock_ins')
          .select('student_id, action_type')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });
          
       if (clockInData) {
          const cMap: Record<string, boolean> = {};
          clockInData.forEach(r => {
             if (cMap[r.student_id] === undefined) {
                cMap[r.student_id] = r.action_type === 'school_check_in';
             }
          });
          setClockIns(cMap);
       } else {
          setClockIns({});
       }
       
       // check today's attendance"""

content = content.replace(
    "setStudents(mapped);\n       \n       // check today's attendance",
    replacement
)

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
