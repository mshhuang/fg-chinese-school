import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createTable() {
  const { data, error } = await supabase.rpc('run_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS school_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          location TEXT,
          type TEXT NOT NULL,
          created_by UUID REFERENCES users(user_id),
          created_at TIMESTAMPTZ DEFAULT now()
      );
      
      ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "school_events_policy" ON school_events;
      CREATE POLICY "school_events_policy" ON school_events FOR ALL USING (true) WITH CHECK (true);
    `
  });
  console.log("Response:", data, error);
}

createTable();
