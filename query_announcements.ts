import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// read from .env if possible
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:5432',
  process.env.VITE_SUPABASE_ANON_KEY || 'abc'
);

async function test() {
  const { data, error } = await supabase.from('announcements').select('content').order('created_at', { ascending: false }).limit(3);
  console.log(JSON.stringify(data, null, 2));
}

test();
