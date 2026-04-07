-- Add RLS policy to allow anonymous reads on subvenciones_solares_ccaa_es
-- This table contains public subsidies data and should be readable by all users

ALTER TABLE subvenciones_solares_ccaa_es ENABLE ROW LEVEL SECURITY;

-- Allow anon reads
CREATE POLICY anon_read_subvenciones 
  ON subvenciones_solares_ccaa_es 
  FOR SELECT 
  TO anon 
  USING (true);

-- Also allow authenticated reads
CREATE POLICY authenticated_read_subvenciones 
  ON subvenciones_solares_ccaa_es 
  FOR SELECT 
  TO authenticated 
  USING (true);
