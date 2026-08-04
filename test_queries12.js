import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('count_all');
  const { count } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
  console.timeEnd('count_all');
  console.log('Total announcements:', count);
}
test();
