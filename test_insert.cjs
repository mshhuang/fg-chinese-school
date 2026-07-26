const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('class_photos').insert([{
    id: 'test-123',
    title: 'test',
    description: 'test',
    image_url: 'test',
    teacher_name: 'test'
  }]);
  console.log("Insert result:", error);
}
main();
