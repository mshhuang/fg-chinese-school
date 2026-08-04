import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: policies } = await supabase.from('pg_policies').select('*').eq('tablename', 'announcements');
  console.log(policies);
}
test();
