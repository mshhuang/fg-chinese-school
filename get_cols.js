import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data } = await supabase.from('classes').select('*').limit(1);
  if (data && data.length > 0) {
     console.log('classes', Object.keys(data[0]));
  }
}
test();
