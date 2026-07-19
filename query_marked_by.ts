import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { error } = await supabase.from('attendance').update({ marked_by: null }).eq('attendance_id', 'b1a423cd-65b3-494e-8eb6-f3a944b68afa');
  console.log("Error:", error);
}
run();
