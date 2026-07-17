require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.time('fetch_simple');
  const selectQuery = `*`;
  const { data: anns, error } = await supabase.from('announcements').select(selectQuery).order('created_at', { ascending: false }).limit(200);
  console.timeEnd('fetch_simple');
  console.log('Error:', error);
}
run();
