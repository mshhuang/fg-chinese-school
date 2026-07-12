import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users } = await supabase.from('users').select('user_id').limit(1);
  if (users.length > 0) {
    const { data, error } = await supabase.from('system_logs').insert({
         user_id: users[0].user_id,
         action_type: 'teacher_clock_in',
         data_changed: { time: new Date().toISOString() },
         user_name: 'Test Teacher'
    });
    console.log("Error:", error);
  }
}
test();
