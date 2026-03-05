create table if not exists public_subsidies (
  id bigserial primary key,
  source_hash text not null unique,
  source_id text not null,
  issuer_scope text not null,
  issuer_name text not null,
  region text not null,
  bulletin_name text,
  title text not null,
  summary text,
  program_code text,
  amount_eur numeric(12,2),
  currency text not null default 'EUR',
  published_at timestamptz,
  deadline_at timestamptz,
  application_url text,
  source_url text not null,
  status text not null default 'open',
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_public_subsidies_scope_region
  on public_subsidies (issuer_scope, region);

create index if not exists idx_public_subsidies_published_at
  on public_subsidies (published_at desc);

create index if not exists idx_public_subsidies_status
  on public_subsidies (status);

create or replace function set_public_subsidies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_public_subsidies_updated_at on public_subsidies;
create trigger trg_public_subsidies_updated_at
before update on public_subsidies
for each row
execute function set_public_subsidies_updated_at();
