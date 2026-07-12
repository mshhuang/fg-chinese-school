const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

async function check() {
  const { data: enrollments, error: enrollError } = await supabase.from('enrollments').select('*').limit(5);
  console.log("Enrollments:", enrollments, enrollError);
  const { data: classes, error: classError } = await supabase.from('classes').select('class_id, class_name').limit(5);
  console.log("Classes:", classes, classError);
}
check();
