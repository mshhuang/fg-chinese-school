require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('class_photos').select('*').like('image_url', '%wa3i9%');
  console.log('Error:', error);
  console.log('Data (by wa3i9):', data);
  
  const { data: data2 } = await supabase.from('class_photos').select('*').like('image_url', '%1785608436880%');
  console.log('Data (by 1785608436880):', data2);
}
run();
