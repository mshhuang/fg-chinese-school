import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: userData } = await supabase
    .from('users')
    .select('user_id, email, user_name')
    .eq('email', 'Ruyanjin@gmail.com')
    .single();

  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles (
        role_name
      )
    `)
    .eq('user_id', userData.user_id);
    
  console.log("Roles for user:", roleData, error);
}
test();
