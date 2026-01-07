-- Minimal accounts schema
create table if not exists public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,

  name text,
  email text not null,

  created_at timestamptz not null default now()
);

create unique index if not exists accounts_id_unique
  on public.accounts(id);
