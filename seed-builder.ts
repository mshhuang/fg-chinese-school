import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function run() {
  const adminRes = await supabase.from('roles').select('*');
  console.log('Current roles:', adminRes.data);
  let builderRole = adminRes.data?.find(r => r.role_name.toLowerCase() === 'builder');
  if (!builderRole) {
     const res2 = await supabase.from('roles').insert({ role_name: 'Builder' }).select('*').single();
     builderRole = res2.data;
     console.log('Inserted role:', res2.data, res2.error);
  } else {
     console.log('Builder role already exists.');
  }
}
run();
