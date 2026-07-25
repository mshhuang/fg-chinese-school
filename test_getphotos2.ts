import dotenv from 'dotenv';
dotenv.config();
import { getPhotos } from './src/lib/photoService';

// Mock import.meta.env
(global as any).import = { meta: { env: process.env } };

async function main() {
  const p = await getPhotos('teacher', 'all');
  console.log("Teacher, all:", p.length);
}
main();
