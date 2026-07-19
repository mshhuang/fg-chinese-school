import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: userError } = await supabase.from('users').select('user_id, first_name, last_name, user_name').ilike('first_name', '%Echo%');
  console.log("Users:", users);

  if (users && users.length > 0) {
    for (const u of users) {
        const id = u.user_id;
        const { data: classData } = await supabase.from('classes').select('class_id, class_name').or(`primary_teacher_id.eq.${id},co_teacher_id.eq.${id},co_teachers.cs.{${id}}`);
        console.log(`Classes for ${id}:`, classData);
    }
  }
}
run();
