import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkPasswords() {
  const { data, error } = await supabase
    .from('users')
    .select('password_hash');
    
  if (error) {
    console.error(error);
  } else {
    const passwords = data.map(d => d.password_hash);
    const unique = [...new Set(passwords)];
    const stats = {};
    for (const p of passwords) {
      stats[p] = (stats[p] || 0) + 1;
    }
    console.log(stats);
  }
}
checkPasswords();
