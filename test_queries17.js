import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data } = await supabase.from('announcements').select('title, target_role_id, target_role_ids, target_class_ids, target_user_ids').limit(10);
  console.log(data.filter(a => !a.target_role_id && !a.target_role_ids?.length && !a.target_class_ids?.length && !a.target_user_ids?.length));
}
test();
