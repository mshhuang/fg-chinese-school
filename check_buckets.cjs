const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets?.map(b => b.name));
}
main();
