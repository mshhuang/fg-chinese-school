const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await supabase.from('class_photos').select('id, title, description, teacher_name, class_name, audience_type');
  console.log(JSON.stringify(data, null, 2));
}
main();
