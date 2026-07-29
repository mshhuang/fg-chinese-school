require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('announcements').select('*').limit(1);
  if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
  }
}
main();
