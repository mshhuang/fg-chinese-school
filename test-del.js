import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: users } = await supabase.from('users').select('user_id').eq('first_name', 'Builder');
  console.log(users);
}
test();
