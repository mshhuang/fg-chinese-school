import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: userData, error } = await supabase
    .from('users')
    .select('email, password_hash')
    .limit(5);
    
  console.log("Users:", userData, error);
}
test();
