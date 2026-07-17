require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.time('fetch_users');
  await supabase.from('users').select('user_id').limit(1);
  console.timeEnd('fetch_users');
}
run();
