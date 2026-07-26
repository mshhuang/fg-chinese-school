const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: users, error } = await supabase.from('users').select('*').ilike('last_name', '%Li%');
  console.log("Users Li:", users);
  
  const { data: users2 } = await supabase.from('users').select('*').ilike('first_name', '%Li%');
  console.log("Users Li (first):", users2);
}
main();
