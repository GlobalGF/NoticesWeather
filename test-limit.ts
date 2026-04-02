import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from('municipios_energia')
    .select('municipio, provincia')
    .limit(10000)
    
  console.log('Total rows fetched:', data?.length)
  console.log('Error:', error)
  console.log('Includes Madrid?', data?.some(d => d.municipio === 'Madrid'))
}

test()
