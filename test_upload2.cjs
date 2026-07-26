const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const fileBody = Buffer.from('test', 'utf8');
  const { data, error } = await supabase.storage.from('class_photos').upload('test.txt', fileBody);
  console.log("Upload result class_photos:", data, error);
}
main();
