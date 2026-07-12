import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data } = await supabase.from('attendance').select('*').limit(1);
  if (data && data.length > 0) {
     console.log(Object.keys(data[0]));
  } else {
     const { data, error } = await supabase.from('attendance').insert({ attendance_id: '11111111-1111-1111-1111-111111111111' });
     console.log(error);
  }
}
test();
