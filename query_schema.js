import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

// Oh wait, I can just read src/db/schema.ts !
