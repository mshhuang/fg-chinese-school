const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: users, error: err1 } = await sb.from('users').select('user_id, role').limit(5);
    const { data: student_classes, error: err3 } = await sb.from('student_classes').select('*').limit(2);
    console.log("users", users, err1);
    console.log("student_classes", student_classes, err3);
}
main();
