const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: users, error: err1 } = await sb.from('users').select('*').limit(1);
    console.log("users keys", Object.keys(users[0] || {}));
    
    // How about the link between classes and students?
    // class_students? class_enrollments?
    
    const tables = ['class_students', 'class_enrollments', 'enrollments', 'student_classes', 'user_classes', 'class_members'];
    for (const t of tables) {
        const { data, error } = await sb.from(t).select('*').limit(1);
        if (!error) {
            console.log("Found table:", t, Object.keys(data[0] || {}));
        }
    }
}
main();
