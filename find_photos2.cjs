const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: photos, error } = await supabase.from('class_photos').select('*').ilike('teacher_name', '%Li%');
  console.log("Photos by teacher Li:", photos, error);
}
main();
