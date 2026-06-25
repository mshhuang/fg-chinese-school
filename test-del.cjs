require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
(async () => {
    const { data: n, error: e1 } = await supabase.from('newsletters').select('*');
    console.log("Newsletters:", n);
    if (n && n.length > 0) {
        const { error } = await supabase.from('newsletters').delete().eq('newsletter_id', n[0].newsletter_id);
        console.log("Delete result error:", error);
    }
})();
