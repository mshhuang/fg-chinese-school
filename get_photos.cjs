const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: photos, error } = await supabase.from('class_photos').select('id, title, teacher_name, class_name');
  console.log("Photos:", photos, error);
}
main();
