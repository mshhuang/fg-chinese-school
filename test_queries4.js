import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('no order');
  const { data: anns1 } = await supabase.from('announcements').select('announcement_id');
  console.timeEnd('no order');
  
  console.time('count');
  const { count } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
  console.timeEnd('count');
  console.log('count:', count);
}

test();
