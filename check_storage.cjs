const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function main() {
  const { data: buckets, error: e1 } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets?.map(b => b.name), e1);
  
  if (buckets) {
      for (const bucket of buckets) {
          const { data: files, error: e2 } = await supabase.storage.from(bucket.name).list('');
          console.log(`Files in ${bucket.name}:`, files?.length, e2);
      }
  }
}
main();
