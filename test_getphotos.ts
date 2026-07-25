import { getPhotos } from './src/lib/photoService';
async function main() {
  const p = await getPhotos('all', 'all');
  console.log("Returned photos:", p.length);
}
main();
