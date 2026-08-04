import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.time('with order');
  const { data: anns1, error: err1 } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(200);
  console.timeEnd('with order');
  console.log('err1', err1?.message);
}

test();
