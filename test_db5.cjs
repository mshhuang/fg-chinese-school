const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: logsData, error: logsError } = await sb
        .from('page_visit_report')
        .select('*')
        .eq('user_role', 'student')
        .limit(10);
    console.log("logsData:", logsData);

    const { data: usersData } = await sb
        .from('users')
        .select('user_id, first_name, last_name, user_name')
        .limit(10);
    console.log("users:", usersData.map(u => ({
        id: u.user_id, 
        fullname: `${u.first_name || ''} ${u.last_name || ''}`.trim().replace(/\s+/g, ' ')
    })));
}
main();
