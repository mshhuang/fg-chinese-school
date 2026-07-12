import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users } = await supabase.from('users').select('*').limit(1);
  if (users && users.length > 0) {
     const currentUser = { id: users[0].user_id, ...users[0] };
     
     const startOfDay = new Date();
     startOfDay.setHours(0,0,0,0);
     const { data, error } = await supabase
       .from('system_logs')
       .select('*')
       .eq('user_id', currentUser.id)
       .in('action_type', ['teacher_clock_in', 'teacher_clock_out'])
       .gte('created_at', startOfDay.toISOString())
       .order('created_at', { ascending: false })
       .limit(1);
     console.log("Fetch result:", data, error);
  } else {
     console.log("No users found");
  }
}
test();
