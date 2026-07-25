import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://xfftjqefsirzfemmklku.supabase.co", process.env.VITE_SUPABASE_ANON_KEY);
const channel = supabase.channel('test_realtime2')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_clock_ins' }, (payload) => {
    console.log("Realtime payload:", payload);
  })
  .subscribe(async (status) => {
    console.log("Status:", status);
    if (status === 'SUBSCRIBED') {
      await supabase.from('staff_clock_ins').insert([{ user_id: '8a81adfc-ccfc-4444-a6f6-8c46564619d0', action_type: 'clock_in' }]);
      setTimeout(() => process.exit(0), 3000);
    }
  });
