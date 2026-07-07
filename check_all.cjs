const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data: users } = await supabase.from('users').select('user_id, email, first_name');
  console.log(users.filter(u => u.email && u.email.includes('janice')));
}
check();
