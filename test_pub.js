import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
// we can check realtime by subscribing
const channel = supabase.channel('test_realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_messages' }, (payload) => {
    console.log("Realtime payload:", payload);
  })
  .subscribe(async (status) => {
    console.log("Status:", status);
    if (status === 'SUBSCRIBED') {
      await supabase.from('internal_messages').insert([{ subject: 'realtime_test', body: 'test' }]);
      setTimeout(() => process.exit(0), 3000);
    }
  });
