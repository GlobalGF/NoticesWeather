// Script to investigate piera-barcelona data for debugging 500/404 errors
import { createSupabaseServerClient } from './lib/supabase/server';

async function investigate() {
  const supabase = await createSupabaseServerClient();
  
  console.log('--- Investigating municipios_energia ---');
  const { data: energyData, error: energyError } = await supabase
    .from('municipios_energia')
    .select('*')
    .eq('slug', 'piera-barcelona')
    .maybeSingle();
    
  if (energyError) console.error('Energy Error:', energyError);
  console.log('Energy Data:', JSON.stringify(energyData, null, 2));

  console.log('--- Investigating municipalities ---');
  const { data: muniData, error: muniError } = await supabase
    .from('municipalities')
    .select('*')
    .eq('slug', 'piera-barcelona')
    .maybeSingle();

  if (muniError) console.error('Muni Error:', muniError);
  console.log('Muni Data:', JSON.stringify(muniData, null, 2));
}

investigate().catch(console.error);
