import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase.from('system_logs').insert({
             user_id: '16fb2f8f-640c-4aed-a3dc-3877e77a0ead',
             user_name: 'Anthony Lin',
             user_role: 'student',
             page_name: "Login",
             path: "/login",
             activity: "Logged into the system",
             action_type: "login",
             data_changed: null,
             browser: 'Chrome',
             ip_address: '127.0.0.1',
             device_type: 'Desktop'
    });
    console.log(error);
}
test();
