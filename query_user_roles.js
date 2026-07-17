require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('user_id, user_name, first_name, last_name')
    .in('user_name', ['fliu', 'wzhan']);
    
  console.log("Users:", users);
  
  if (users && users.length > 0) {
    for (const u of users) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*, roles(role_name)')
        .eq('user_id', u.user_id);
      console.log(`Roles for ${u.user_name}:`, roles);
    }
  }
}
run();
