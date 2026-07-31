const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql_statement: "SELECT polname, polqual FROM pg_policy WHERE polrelid = 'announcements'::regclass;" });
  console.log(JSON.stringify(data, null, 2), error);
}
run();
