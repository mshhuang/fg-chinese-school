import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

const env = dotenv.parse(fs.readFileSync('.env.example', 'utf8'));

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { error } = await supabase.from('system_logs').insert({
    activity: "Test log",
    action_type: "login"
  });
  console.log("Insert error:", error);
}
test();
