const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: news, error } = await supabase.from('newsletters').select('*').limit(3);
  console.log("Newsletters:", news);
}
main();
