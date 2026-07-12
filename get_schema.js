import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'fake';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data } = await supabase.from('system_logs').select('*').limit(1);
  if (data && data.length > 0) {
     console.log(Object.keys(data[0]));
  } else {
     console.log('empty or failed', data);
  }
}
test();
