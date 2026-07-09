const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('assignments').select('class_id').eq('assignment_id', 17);
  console.log(data);
  if (data && data.length) {
    const { data: cls } = await supabase.from('classes').select('*').eq('class_id', data[0].class_id);
    console.log(cls);
  }
}
run();
