import { getPhotos } from './src/lib/photoService';

// Mock localStorage
(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Mock import.meta.env for supabase
import dotenv from 'dotenv';
dotenv.config();
(global as any).import = { meta: { env: process.env } };

async function main() {
  const p = await getPhotos('all', 'all');
  console.log("Photos returned:", p.length);
  console.log(p.map(x => x.title));
}
main();
