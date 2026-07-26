const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const sql = fs.readFileSync('create_ann_storage.sql', 'utf8');

// We have no generic SQL endpoint. Let's just create bucket via storage api.
// Supabase storage api doesn't allow creating buckets anonymously if no RLS allows it.
