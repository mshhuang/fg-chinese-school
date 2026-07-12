const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

async function check() {
  const { data, error } = await supabase.from('enrollments').select('*').limit(5);
  console.log('Enrollments:', data, error);
}
check();
