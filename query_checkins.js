import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: students, error: sErr } = await supabase.from('student_clock_ins').select('student_id, users:student_id(first_name, last_name), action_type, created_at').gte('created_at', startOfDay.toISOString());
  
  if (students && students.length > 0) {
     console.log("Students:", students);
  } else {
     console.log("No student check-ins");
  }
}
run();
