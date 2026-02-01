
import { db } from './src/lib/db';

async function main() {
  try {
    console.log('Checking db.listing...');
    if (db.listing) {
      console.log('db.listing exists');
      const count = await db.listing.count();
      console.log('Listing count:', count);
    } else {
      console.error('db.listing is UNDEFINED');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
