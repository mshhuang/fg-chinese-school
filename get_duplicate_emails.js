import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: usersData, error } = await supabase
    .from('users')
    .select('user_id, email, password_hash, user_name, first_name, last_name');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const emailCounts = {};
  for (const u of usersData) {
      if (!u.email) continue;
      emailCounts[u.email] = (emailCounts[u.email] || 0) + 1;
  }
  
  const duplicateEmails = Object.keys(emailCounts).filter(e => emailCounts[e] > 1);
  
  const parentUsers = usersData.filter(u => duplicateEmails.includes(u.email));
  console.log("Users with duplicate emails (implicitly parents):", parentUsers.map(u => ({ email: u.email, first_name: u.first_name, last_name: u.last_name, password: u.password_hash })));
}
test();
