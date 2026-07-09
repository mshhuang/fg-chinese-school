const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase
    .from('assignment_students')
    .select('*')
    .eq('assignment_id', 17);
  console.log(JSON.stringify(data, null, 2));
}
run();
