const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.rpc('run_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'objects';" });
    console.log(data, error);
}
main();
