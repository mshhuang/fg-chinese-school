import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // we cannot fetch policies with anon key easily, let's just query pg_policies using rpc if available, or we can use the postgres connection string if we have it? We don't have it.
    // However, if we do a delete with anon key for a row we didn't create, it might fail.
    console.log(process.env.VITE_SUPABASE_URL);
}
run();
