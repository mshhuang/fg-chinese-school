require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase
    .from('staff_clock_ins')
    .select('*, users(first_name, last_name)')
    .order('created_at', {ascending: false})
    .limit(10);
  console.log("Staff history:", data, error);
}
run();
