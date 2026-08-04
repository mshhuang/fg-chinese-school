import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('order_id');
  const { error } = await supabase.from('announcements')
      .select('*')
      .order('announcement_id', { ascending: false })
      .limit(50);
  console.timeEnd('order_id');
  console.log('err:', error?.message);
}
test();
