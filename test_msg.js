import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('internal_messages').update({ read_at: new Date().toISOString() }).eq('subject', 'test');
  console.log("Update msg:", data, error);
}
run();
