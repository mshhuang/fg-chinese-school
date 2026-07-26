const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: photos, error } = await supabase.from('class_photos').select('*');
  console.log("Photos:", photos?.length);
  if (photos && photos.length > 0) {
      console.log("First photo:", photos[0].teacher_name);
  }
}
main();
