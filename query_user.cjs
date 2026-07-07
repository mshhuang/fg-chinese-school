const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data } = await supabase.from('users').select('user_id, email').eq('user_id', '33881bb6-b698-460c-82b8-7c49229e8c59');
  console.log(JSON.stringify(data, null, 2));
}
check();
