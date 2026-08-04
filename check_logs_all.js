import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data: logs } = await supabase.from('system_logs').select('*').ilike('action', '%warning%').order('created_at', { ascending: false }).limit(20);
    console.log("System Logs Warnings:", logs);
    
    const { data: errlogs } = await supabase.from('error_logs').select('*').ilike('message', '%warning%').order('created_at', { ascending: false }).limit(20);
    console.log("Error Logs Warnings:", errlogs);
}
test()
