const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('classes').select('*, users!classes_primary_teacher_id_fkey(first_name, last_name)').limit(5);
  console.log(JSON.stringify(data, null, 2));
}
run();
