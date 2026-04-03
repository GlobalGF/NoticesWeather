import { searchLocations } from './app/actions/searchLocations';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function testSearch() {
  console.log('--- Searching for "alava" ---');
  const results = await searchLocations('alava');
  console.log('Results:', JSON.stringify(results, null, 2));
}

testSearch().catch(console.error);
