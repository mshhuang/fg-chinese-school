const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { error } = await supabase.from('class_photos').delete().eq('id', 'test-123');
  console.log("Delete result:", error);
}
main();
