const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data: user } = await supabase.from('users').select('*').eq('email', 'janice.yang267@gmail.com').single();
  console.log("Janice ID:", user.user_id);
  const { data: enrollments } = await supabase.from('enrollments').select('*').eq('student_id', user.user_id);
  console.log("Enrollments:", enrollments);
  const { data: classes } = await supabase.from('classes').select('*').eq('primary_teacher_id', user.user_id);
  console.log("Teacher classes:", classes);
  const { data: children } = await supabase.from('parent_child').select('*').eq('parent_id', user.user_id);
  console.log("Children:", children);
}
check();
