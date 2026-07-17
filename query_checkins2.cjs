require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const today = new Date().toLocaleDateString('en-CA');
  
  // Check staff clock-ins
  const { data: staffClock, error: staffError } = await supabase
    .from('staff_clock_ins')
    .select('*')
    .gte('created_at', today + 'T00:00:00');

  console.log("Staff clock-ins today:", staffClock, staffError);
}
run();
