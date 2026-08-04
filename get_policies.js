import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function check() {
    const res = await fetch(`${url}/rest/v1/rpc/get_policies`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    console.log(res.status, await res.text());
}
check();
