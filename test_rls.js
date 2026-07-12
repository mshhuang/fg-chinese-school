import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('system_logs').insert({
       user_id: '64c7575c-1eb3-4a4e-9964-d8a9dfc7aa77',
       action_type: 'teacher_clock_in',
       data_changed: { time: new Date().toISOString() },
       user_name: 'Test Teacher 2'
  });
  console.log("Insert from anon:", error);
}
test();
