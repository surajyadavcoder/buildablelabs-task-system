-- Run this in Supabase SQL Editor

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_done boolean default false,
  client_id text,                -- id generated on mobile when created offline
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  deleted boolean default false  -- soft delete, helps offline sync know what to remove
);

-- Auto update updated_at on every row change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_set_updated_at
before update on tasks
for each row execute procedure set_updated_at();
