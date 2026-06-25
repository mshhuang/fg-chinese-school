import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const studentIds = [
    '20ebb699-ce5f-4dbe-a0fa-a741c8d4b3d0',
    '8015fd96-b01f-4dbc-ae4d-faa234916d34',
    'd13d6c75-6c9c-4971-aa3b-41e5ea04e401'
  ];
  const { data, error } = await supabase.from('users').select('user_id, first_name, last_name').in('user_id', studentIds);
  console.log(data, error);
}
run();
