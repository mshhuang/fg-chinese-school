require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('class_photos').select('*').order('created_at', { ascending: false }).limit(20);
  console.log('Recent 20 photos in DB:');
  data.forEach(p => console.log(p.image_url));
}
run();
