const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: roles } = await supabase.from('roles').select('*').eq('role_name', 'Builder').single();
  if (roles) {
     const { data: userRoles } = await supabase.from('user_roles').select('*').eq('role_id', roles.role_id);
     if (userRoles && userRoles.length > 0) {
        const u = await supabase.from('users').select('*').in('user_id', userRoles.map(u => u.user_id));
        console.log("Builders:", u.data);
     } else {
        console.log("No builder user found.");
     }
  } else {
     console.log("No builder role.");
  }
}
test();
