require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.time('fetch_bare');
  const { data: anns, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(20);
  console.timeEnd('fetch_bare');
}
run();
