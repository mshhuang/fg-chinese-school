const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data: users, error: err1 } = await sb.from('users').select('*').limit(1);
    console.log("users", users, err1);
    
    // Check all tables
    const { data: policies, error: err_p } = await sb.rpc('run_sql', { sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" });
    console.log("tables", policies, err_p);
}
main();
