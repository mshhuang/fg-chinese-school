import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('attendance').update({ activity_status: 'check-in the building' }).eq('attendance_id', '00000000-0000-0000-0000-000000000000');
  console.log(error);
}
test();
