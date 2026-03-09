-- =========================================================
-- seo_generation_errors
-- Log de errores del flujo n8n de generacion SEO.
-- =========================================================

create table if not exists public.seo_generation_errors (
  id            bigserial primary key,
  slug          text,
  municipio     text,
  provincia     text,
  error_stage   text,
  error_message text,
  raw_response  text,
  run_id        text,
  created_at    timestamptz not null default now()
);

-- Mantener script re-ejecutable aunque ya exista la tabla.
alter table if exists public.seo_generation_errors
  add column if not exists slug text,
  add column if not exists municipio text,
  add column if not exists provincia text,
  add column if not exists error_stage text,
  add column if not exists error_message text,
  add column if not exists raw_response text,
  add column if not exists run_id text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_seo_generation_errors_created_at
  on public.seo_generation_errors (created_at desc);

create index if not exists idx_seo_generation_errors_slug
  on public.seo_generation_errors (slug);

-- Permisos para API de Supabase/PostgREST.
grant select, insert on table public.seo_generation_errors to service_role;

grant usage, select on sequence public.seo_generation_errors_id_seq to service_role;

-- Recargar schema cache de PostgREST.
notify pgrst, 'reload schema';
