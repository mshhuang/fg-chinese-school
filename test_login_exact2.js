import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = "ruyanjin@gmail.com";
  const password = "j400";

  const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike."${email}",user_name.ilike."${email}"`)
        .eq('password_hash', password)
        .limit(1)
        .maybeSingle();

  console.log("User:", userData?.email, error);
}
test();
