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
  
  const { data: roleData } = await supabase
    .from('user_roles')
    .select(`user_id, roles ( role_name )`);
    
  const nonParentUserIds = new Set();
  for (const r of roleData) {
      const roleName = r.roles?.role_name?.toLowerCase();
      if (['admin', 'teacher', 'staff', 'builder', 'volunteer'].includes(roleName)) {
          nonParentUserIds.add(r.user_id);
      }
  }
  
  const parentUsers = usersData.filter(u => u.email && u.email.includes('@') && !nonParentUserIds.has(u.user_id));
  
  console.log(`Updating passwords for ${parentUsers.length} parent users (users with emails who are not staff/admin)...`);
  
  for (const user of parentUsers) {
      const { error: updateError } = await supabase
          .from('users')
          .update({ password_hash: '123' })
          .eq('user_id', user.user_id);
          
      if (updateError) {
          console.error(`Error updating user ${user.email}:`, updateError);
      } else {
          console.log(`Updated password for ${user.first_name} ${user.last_name} (${user.email})`);
      }
  }
  
  console.log("Done.");
}
test();
