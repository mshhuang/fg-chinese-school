require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { count, error } = await supabase.from('announcement_replies').select('*', { count: 'exact', head: true });
  console.log('Replies:', count, 'Error:', error);
}
run();
