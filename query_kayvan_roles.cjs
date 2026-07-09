const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('user_roles').select('*, roles(role_name)').eq('user_id', '9512a15a-f2c0-4bd9-96b8-c05ebaed05ea');
  console.log(data);
}
run();
