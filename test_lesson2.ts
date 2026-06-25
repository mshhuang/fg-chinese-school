import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: d2, error: e2 } = await supabase.from('lesson_plans').insert({ title: 'Test2', teacher_id: null, week_number: 1 }).select();
  console.log("INSERT error with week_number:", e2);
}
run();
