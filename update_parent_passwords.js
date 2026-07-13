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
  
  console.log("Updating passwords for users with duplicate emails...");
  
  for (const user of parentUsers) {
      const { error: updateError } = await supabase
          .from('users')
          .update({ password_hash: '123' })
          .eq('user_id', user.user_id);
          
      if (updateError) {
          console.error(`Error updating user ${user.email}:`, updateError);
      } else {
          console.log(`Updated password for ${user.first_name} ${user.last_name} (${user.email})`);
      }
  }
  
  console.log("Done.");
}
test();
