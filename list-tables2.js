import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('class_teachers').select('*').limit(1);
  if(data) console.log("Has class_teachers");
  else console.log("No class_teachers");
  
  const { data: d2 } = await supabase.from('class_staff').select('*').limit(1);
  if(d2) console.log("Has class_staff");
  else console.log("No class_staff");
  
  const { data: d3 } = await supabase.from('staff_classes').select('*').limit(1);
  if(d3) console.log("Has staff_classes");
  else console.log("No staff_classes");
}
run();
