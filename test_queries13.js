import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('no_order');
  const { error } = await supabase.from('announcements')
      .select('announcement_id')
      .limit(50);
  console.timeEnd('no_order');
  console.log('err:', error?.message);
}
test();
