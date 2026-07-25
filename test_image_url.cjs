const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await supabase.from('class_photos').select('id, image_url').eq('teacher_name', 'Mr. Li');
  if (data && data[0]) {
    console.log("Starts with:", data[0].image_url.substring(0, 50));
  }
}
main();
