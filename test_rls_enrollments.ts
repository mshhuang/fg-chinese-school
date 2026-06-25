import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: enrolls, error: enrollError } = await supabase.from('enrollments').select('student_id').eq('class_id', 'e1112fba-52b4-4f2c-b080-99a7b2d0ca0d');
  console.log("Enrolls:", enrolls?.length, enrollError);
}
run();
