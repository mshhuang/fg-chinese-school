const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('classes').select('*').or('primary_teacher_id.eq.9512a15a-f2c0-4bd9-96b8-c05ebaed05ea,co_teacher_id.eq.9512a15a-f2c0-4bd9-96b8-c05ebaed05ea');
  console.log(data);
}
run();
