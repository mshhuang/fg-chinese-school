const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('internal_messages').select('*').limit(1);
  console.log(error);
  if (data) console.log(data);
}
test();
