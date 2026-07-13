import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: usersData, error } = await supabase
    .from('users')
    .select('user_id, email, first_name, last_name');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const emailCounts = {};
  for (const u of usersData) {
      if (!u.email) continue;
      if (!emailCounts[u.email]) {
          emailCounts[u.email] = [];
      }
      emailCounts[u.email].push(`${u.first_name} ${u.last_name}`.trim());
  }
  
  const emailsWithTwoOrMore = Object.keys(emailCounts)
    .filter(e => emailCounts[e].length >= 2)
    .map(e => ({
        email: e,
        children: emailCounts[e]
    }));
    
  console.log(JSON.stringify(emailsWithTwoOrMore, null, 2));
}
test();
