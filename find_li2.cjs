const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: roles } = await supabase.from('roles').select('*').eq('role_name', 'Teacher');
  if (!roles || roles.length === 0) return;
  const teacherRoleId = roles[0].role_id;
  
  const { data: userRoles } = await supabase.from('user_roles').select('user_id').eq('role_id', teacherRoleId);
  const teacherIds = userRoles.map(ur => ur.user_id);
  
  const { data: teachers } = await supabase.from('users').select('*').in('user_id', teacherIds).ilike('last_name', '%Li%');
  console.log("Teachers with Li:", teachers);
  
  const { data: teachers2 } = await supabase.from('users').select('*').in('user_id', teacherIds).ilike('first_name', '%Li%');
  console.log("Teachers with Li (first):", teachers2);
}
main();
