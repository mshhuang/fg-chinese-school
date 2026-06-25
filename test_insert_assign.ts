import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('assignments').insert({
    class_id: 'e1112fba-52b4-4f2c-b080-99a7b2d0ca0d',
    teacher_id: 'c3199419-baf6-4cf5-bf30-06c81ce79ed3',
    title: 'Test',
    description: 'Test',
    due_date: null,
    type: 'Writing'
  }).select();
  console.log(data, error);
}
run();
