require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { count } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
  console.log(count);
}
run();
