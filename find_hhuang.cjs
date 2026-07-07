const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data } = await supabase.from('users').select('*').ilike('email', 'hhuang%');
  console.log("hhuang:", data);
}
test();
