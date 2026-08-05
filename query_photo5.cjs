require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.storage.from('class_photos').list('', { limit: 100, search: 'wa3i9' });
  console.log('Error:', error);
  console.log('Files:', data);
  
  const { data: data2 } = await supabase.storage.from('class_photos').list('', { limit: 100, search: '1785608436880' });
  console.log('Files (by 1785608436880):', data2);
}
run();
