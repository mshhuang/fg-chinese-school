const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data: msgs } = await supabase.from('internal_messages').select('*').limit(1);
  console.log('msg', msgs[0]);
  const res = await supabase.from('internal_messages').delete().eq('message_id', msgs[0].message_id);
  console.log('delete err', res.error);
}
test();
