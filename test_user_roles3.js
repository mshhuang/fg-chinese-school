import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: userData } = await supabase
    .from('users')
    .select('user_id, email, user_name')
    .limit(1);

  console.log("User:", JSON.stringify(userData));
}
test();
