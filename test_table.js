import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const res1 = await supabase.from('staff_attendance').select('*').limit(1);
  console.log("staff_attendance:", res1.error ? res1.error.message : "Exists");
  const res2 = await supabase.from('attendance').select('*').limit(1);
  console.log("attendance:", res2.error ? res2.error.message : "Exists");
}
test();
