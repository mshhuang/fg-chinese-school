import { supabase } from './src/lib/supabase.ts';
async function run() {
  const { data, error } = await supabase.from('staff_clock_ins').select('*, users(first_name, last_name, email)').order('created_at', { ascending: false }).limit(5);
  if (error) console.error("Error:", error);
  else console.log(JSON.stringify(data, null, 2));
}
run();
