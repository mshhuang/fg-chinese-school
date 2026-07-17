require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const today = new Date().toLocaleDateString('en-CA');
  
  // Check building check-ins
  const { data: checkins, error } = await supabase
    .from('checkin_logs')
    .select('*, users!checkin_logs_user_id_fkey(first_name, last_name, email)')
    .gte('created_at', today + 'T00:00:00')
    .lte('created_at', today + 'T23:59:59');

  console.log("Check-ins today:", checkins);
}
run();
