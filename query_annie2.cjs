require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data: users } = await supabase.from('users').select('*').ilike('first_name', '%Annie%').ilike('last_name', '%Han%');
  if (users && users.length > 0) {
      for (const u of users) {
          const { data: enrollments, error } = await supabase.from('enrollments').select('*, classes(*)').eq('student_id', u.user_id);
          console.log('Enrollments for', u.first_name, u.last_name, ':', JSON.stringify(enrollments, null, 2), error);
          
          // Let's also check if they are in 'users' with roles maybe?
          const { data: roles } = await supabase.from('user_roles').select('*, roles(*)').eq('user_id', u.user_id);
          console.log('Roles:', JSON.stringify(roles, null, 2));
          
          // Let's check classes directly
          const { data: classData } = await supabase.from('classes').select('*');
          console.log('All classes:', classData?.map(c => ({id: c.class_id, name: c.class_name, students: c.students})));
      }
  }
}
main();
