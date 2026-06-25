import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('lesson_plans').select('*');
  console.log("SELECT error:", error);
  const { data: d2, error: e2 } = await supabase.from('lesson_plans').insert({ title: 'Test', teacher_id: null }).select();
  console.log("INSERT error:", e2);
}
run();
