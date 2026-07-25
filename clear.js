import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  await supabase.from('class_photos').delete().neq('id', '0');
}
run();
