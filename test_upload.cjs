const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const fileBody = Buffer.from('test', 'utf8');
  const { data, error } = await supabase.storage.from('newsletter_pdfs').upload('test.txt', fileBody);
  console.log("Upload result:", data, error);
}
main();
