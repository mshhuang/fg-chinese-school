import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('users');
  const { data, error } = await supabase.from('users').select('user_id, first_name, last_name, email, user_roles(roles(role_name))');
  console.timeEnd('users');
  console.log('err:', error?.message);
  console.log('len:', data?.length);
}
test();
