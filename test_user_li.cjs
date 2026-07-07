const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: users } = await supabase.from('users').select('*').eq('user_id', '33881bb6-b698-460c-82b8-7c49229e8c59');
  console.log(users);
}
test();
