require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const today = new Date().toLocaleDateString('en-CA');
  const { data, error } = await supabase
    .from('student_clock_ins')
    .select('*, users!student_id(first_name, last_name, email)')
    .gte('created_at', today + 'T00:00:00');
  console.log("Students today:", data, error);
}
run();
