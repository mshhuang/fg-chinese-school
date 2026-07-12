import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = "Ruyanjin@gmail.com";
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${email},user_name.eq.${email}`)
    .limit(1)
    .maybeSingle();
    
  console.log("Found:", userData ? userData.email : null, error);
}
test();
