import { getProvinceStats } from './lib/data/getProvinceStats';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function verifyFix() {
  console.log('--- Verifying Álava ---');
  const alava = await getProvinceStats('alava');
  if (alava) {
    console.log('Success: Álava found');
    console.log('Total Municipios:', alava.totalMunicipios);
  } else {
    console.error('Failure: Álava not found');
  }

  console.log('\n--- Verifying A Coruña ---');
  const coruna = await getProvinceStats('a-coruna');
  if (coruna) {
    console.log('Success: A Coruña found');
    console.log('Total Municipios:', coruna.totalMunicipios);
    console.log('Sample Municipio:', coruna.municipios[0]);
  } else {
    console.error('Failure: A Coruña not found');
  }
}

verifyFix().catch(console.error);
