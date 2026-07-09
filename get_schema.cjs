const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_schema_info'); // or just standard pg_catalog query
  if (error) {
    const { data: cols } = await supabase.from('classes').select('*').limit(1);
    console.log("classes columns:", cols ? Object.keys(cols[0]) : []);
  } else {
    console.log(data);
  }
}
run();
