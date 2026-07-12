import re

with open('src/pages/AttendanceSheet.tsx', 'r') as f:
    content = f.read()

replacement = """  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);"""

toggle_func = """  const toggleClockIn = async (studentId: string, isCurrentlyClockedIn: boolean) => {
     const actionType = isCurrentlyClockedIn ? 'school_check_out' : 'school_check_in';
     const dailyStatus = isCurrentlyClockedIn ? 'classes over' : 'check-in the building';
     
     // Optimistic update
     setClockIns(prev => ({ ...prev, [studentId]: !isCurrentlyClockedIn }));
     
     await supabase.from('student_clock_ins').insert({
        student_id: studentId,
        action_type: actionType,
        daily_status: dailyStatus
     });
  };

  const handleSaveAttendance = async () => {"""

content = content.replace(replacement, toggle_func)

with open('src/pages/AttendanceSheet.tsx', 'w') as f:
    f.write(content)
