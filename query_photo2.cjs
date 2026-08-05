require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('class_photos').select('*').like('image_url', '%photo_1785608524144_2eeh8.jpeg%');
  console.log('Error:', error);
  console.log('Data:', data);
  
  const { data: allData } = await supabase.from('class_photos').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent 5 photos:', allData);
}
run();
