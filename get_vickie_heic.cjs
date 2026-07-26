const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await supabase.from('class_photos').select('id, title, teacher_name').eq('teacher_name', 'Ms. Vickie');
  console.log(JSON.stringify(data, null, 2));
}
main();
