import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: users, error: uErr } = await supabase.from('users').select('user_id').eq('first_name', 'Vickie').limit(1);
  if (users && users.length > 0) {
    const userId = users[0].user_id;
    const { data, error } = await supabase.from('staff_clock_ins').insert({
       user_id: userId,
       action_type: 'clock_in',
       daily_status: 'check-in the building'
    });
    console.log("Insert Error:", error);
    
    const { data: logs, error: lErr } = await supabase.from('staff_clock_ins').select('*').eq('user_id', userId);
    console.log("Select Error:", lErr);
    console.log("Logs:", logs);
  } else {
    console.log("User not found", uErr);
  }
}
test();
