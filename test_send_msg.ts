import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function test() {
    const { error } = await supabase.from('internal_messages').insert({
        sender_id: '95fd7834-d80f-4a6f-ac11-1dd02ba702a7', 
        recipient_id: '95fd7834-d80f-4a6f-ac11-1dd02ba702a7',
        body: 'test'
    });
    console.log("Error:", error);
}
test();
