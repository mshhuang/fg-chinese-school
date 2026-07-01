import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function test() {
  const { data: users } = await supabase.from('users').select('*').limit(2);
  const userId = users?.[0]?.user_id;
  const studentId = users?.[1]?.user_id;
  const { data: classes } = await supabase.from('classes').select('*').limit(1);
  const classId = classes?.[0]?.class_id;
  
  if (userId && classId && studentId) {
    const { data, error } = await supabase.from('attendance').insert({
      class_id: classId,
      student_id: studentId,
      attendance_date: new Date().toISOString().split('T')[0],
      marked_by: userId,
      status: 'Present'
    }).select();
    console.log("Error:", error);
    console.log("Data:", data);
  }
}
test();
