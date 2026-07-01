import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function query() {
  const { data: users } = await supabase.from('users').select('*').ilike('first_name', '%Liam%');
  console.log('Liam Users:', users);
  
  if (users && users.length > 0) {
    const liamId = users[0].user_id;
    const { data: enrollments } = await supabase.from('enrollments').select('*').eq('student_id', liamId);
    console.log('Enrollments:', enrollments);
    
    if (enrollments && enrollments.length > 0) {
      for (const enr of enrollments) {
        if (enr.class_id) {
            const { data: classes } = await supabase.from('classes').select('*').eq('class_id', enr.class_id);
            console.log('Class:', classes);
        }
      }
    }
  }
}
query();
