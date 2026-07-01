import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function test() {
  const { data, error } = await supabase
       .from('attendance')
       .select(`
         *,
         users:student_id (first_name, last_name, user_name),
         classes!inner (class_id, class_name, primary_teacher_id)
       `);
  console.log("Error:", JSON.stringify(error, null, 2));
  console.log("Data:", data?.length);
}
test();
