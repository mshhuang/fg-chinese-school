const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { error } = await supabase.from('class_photos').delete().eq('teacher_name', 'Mr. Li').like('image_url', 'data:image/heic%');
  if (error) console.error(error);
  else console.log("Deleted HEIC photos!");
}
main();
