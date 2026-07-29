const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: users, error: err1 } = await sb.from('users').select('id, role').limit(5);
    const { data: classes, error: err2 } = await sb.from('classes').select('*').limit(2);
    const { data: class_students, error: err3 } = await sb.from('class_students').select('*').limit(2);
    const { data: logs, error: err4 } = await sb.from('system_logs').select('action_type, activity').limit(5);
    console.log(users, err1);
    console.log(classes, err2);
    console.log(class_students, err3);
    console.log(logs, err4);
}
main();
