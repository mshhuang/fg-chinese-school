import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const id = '0b58d119-d773-439b-9089-c912b2bd8a80';
  const { error } = await supabase.from('enrollments').delete().eq('student_id', id);
  console.log("Delete enrollment error:", error);
}
run();
