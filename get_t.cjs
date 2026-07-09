const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('users').select('*').limit(50);
  console.log(data.filter(u => u.first_name === 'Vickie' || u.first_name === 'Janice' || u.first_name === 'Clara' || u.first_name === 'LiLian' || u.first_name === 'Leah' || u.first_name === 'Ellen'));
}
run();
