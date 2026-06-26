import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: enrollments } = await supabase.from('enrollments').select('*');
  const { data: classes } = await supabase.from('classes').select('*');
  console.log('enrollments:', enrollments);
  console.log('classes:', classes);
}
test();
