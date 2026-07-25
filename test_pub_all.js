import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
const channel = supabase.channel('schema-db-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe(async (status) => {
    console.log("Status:", status);
    if (status === 'SUBSCRIBED') {
      await supabase.from('internal_messages').insert([{ subject: 'realtime_test_2', body: 'test' }]);
      setTimeout(() => process.exit(0), 3000);
    }
  });
