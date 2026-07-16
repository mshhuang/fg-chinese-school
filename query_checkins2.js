import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: users, error: sErr } = await supabase.from('staff_clock_ins').select('*, users:user_id(first_name, last_name)').gte('created_at', startOfDay.toISOString());
  
  if (users && users.length > 0) {
     console.log("Users:", users);
  } else {
     console.log("No staff check-ins");
  }
}
run();
