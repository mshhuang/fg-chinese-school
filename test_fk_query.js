import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// We need the postgres connection string to query information_schema, which we don't have.
// Let's use the REST api if possible? We can't query information_schema from REST.
