const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.from('class_photos').insert([{
      id: 'test_policy',
      title: 'test'
    }]);
    if (error) console.error("Policy Error:", error);
    else {
      console.log("Insert success!");
      await supabase.from('class_photos').delete().eq('id', 'test_policy');
    }
}
main();
