const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('classes').select(`
    *,
    users:primary_teacher_id(first_name, last_name),
    co_teacher:co_teacher_id(first_name, last_name)
  `).limit(1);
  console.log(error || data);
}
run();
