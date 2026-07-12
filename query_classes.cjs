const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

async function check() {
  const { data, error } = await supabase.from('classes').select('co_teachers').limit(1);
  console.log(error);
}
check();
