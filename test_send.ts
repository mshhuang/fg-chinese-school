import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function test() {
    const { data: roles } = await supabase.from('roles').select('role_id').eq('role_name', 'Admin');
    console.log("Roles:", roles);
    if (roles && roles.length > 0) {
      const adminRoleId = roles[0].role_id;
      const { data: adminUsers } = await supabase.from('user_roles')
        .select('user_id')
        .eq('role_id', adminRoleId);
        
      console.log("Admin Users:", adminUsers);
    }
}
test();
