const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.storage.createBucket('class_photos', {
    public: true
  });
  console.log("Bucket creation:", data, error);
}
main();
