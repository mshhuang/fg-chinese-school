const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: policies, error } = await supabase.rpc('get_policies_for_table', { table_name: 'class_photos' });
  console.log("Policies:", policies, error);
}
main();
