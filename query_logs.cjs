const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) console.error(error);
    else console.log("Logs:", data);
}
main();
