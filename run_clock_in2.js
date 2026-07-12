import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: users } = await supabase.from('users').select('*').limit(1);
    const user = users[0];
    const newStatus = 'clocked_in';
    
    const { data, error } = await supabase.from('system_logs').insert({
       user_id: (user?.user_id || user?.id),
       action_type: newStatus === 'clocked_in' ? 'teacher_clock_in' : 'teacher_clock_out',
       activity: newStatus === 'clocked_in' ? 'Clocked in for the day.' : 'Clocked out for the day.',
       page_name: 'Teacher Dashboard',
       data_changed: { time: new Date().toISOString() },
       user_name: user.first_name + ' ' + user.last_name
    }).select();
    console.log("Error clocking in:", error, data);
}
test();
