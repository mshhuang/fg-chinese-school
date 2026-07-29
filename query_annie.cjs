require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data: users, error } = await supabase.from('users').select('*').ilike('first_name', '%Annie%').ilike('last_name', '%Han%');
  if (error) console.error(error);
  console.log('Users:', users);
  
  if (users && users.length > 0) {
      for (const u of users) {
          const { data: enrollments } = await supabase.from('enrollments').select('*, classes(class_name, grade_level)').eq('student_id', u.user_id);
          console.log('Enrollments for', u.first_name, u.last_name, ':', JSON.stringify(enrollments, null, 2));
      }
  }
}
main();
