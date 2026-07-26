const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: photos, error } = await supabase.from('class_photos').select('*').eq('uploaded_by', '33881bb6-b698-460c-82b8-7c49229e8c59');
  console.log("Photos by Yang Li:", photos, error);
}
main();
