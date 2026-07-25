import { getPhotos } from './src/lib/photoService';

// Mock localStorage
const store: any = {};
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => { store[key] = val; }
};
(global as any).window = {
  dispatchEvent: () => {}
};

// Mock import.meta.env for supabase
import dotenv from 'dotenv';
dotenv.config();
(global as any).process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
(global as any).process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// we need to mock import.meta.env since supabase.ts uses it directly
