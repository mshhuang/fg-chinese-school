import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const realUserId = '9a5e12f8-0c6f-474c-836e-1d57f9202a6c';
  console.time('classes');
  const classRes = await supabase.from('classes').select('class_id')
    .or(`primary_teacher_id.eq.${realUserId},co_teacher_id.eq.${realUserId},co_teachers.cs.{${realUserId}}`);
  console.timeEnd('classes');
  console.log('err:', classRes.error?.message);
}
test();
