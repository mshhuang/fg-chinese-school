import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: usersData, error } = await supabase
    .from('users')
    .select('user_id, email, password_hash, user_name, first_name, last_name');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const userIds = usersData.map(u => u.user_id);
  const { data: roleData } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      roles ( role_name )
    `)
    .in('user_id', userIds);
    
  const parentUsers = usersData.filter(u => {
    const roles = roleData.filter(r => r.user_id === u.user_id).map(r => r.roles.role_name.toLowerCase());
    return roles.includes('parent');
  });
  
  console.log("Parent Users:", parentUsers);
}
test();
