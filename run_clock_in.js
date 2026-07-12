import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.example', 'utf8');
const supabaseUrlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const supabaseKeyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = supabaseUrlMatch[1];
const supabaseKey = supabaseKeyMatch[1];

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
    });
    console.log("Error clocking in:", error, data);
}
test();
