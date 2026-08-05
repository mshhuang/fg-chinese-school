require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('class_photos').select('*').like('image_url', '%photo_1785608436880_wa3i9.jpeg%');
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
