import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
async function run() {
  const { data: classes, error } = await supabase.from('classes').select('*');
  console.log('Classes:', classes);
  const { data: enrollments } = await supabase.from('class_enrollments').select('*').limit(5);
  console.log('Enrollments:', enrollments);
}
run();
