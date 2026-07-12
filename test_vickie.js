import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: users } = await supabase.from('users').select('user_id').eq('first_name', 'Vickie').limit(1);
  if (users.length > 0) {
    const { data: logs } = await supabase.from('staff_clock_ins').select('*').eq('user_id', users[0].user_id);
    console.log("Logs:", logs.length);
  }
}
test();
