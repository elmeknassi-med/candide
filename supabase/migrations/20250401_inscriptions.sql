-- Table: inscriptions
create table if not exists public.inscriptions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),

  -- Cycle
  cycle           text not null check (cycle in ('maternelle','primaire')),

  -- Student
  student_first   text not null,
  student_last    text not null,
  birth_date      date not null,
  gender          text not null check (gender in ('M','F')),
  nationality     text,
  level           text not null,

  -- Parent
  parent_first    text not null,
  parent_last     text not null,
  email           text not null,
  phone           text not null,
  address         text,
  message         text,

  -- Status
  status          text not null default 'pending'
    check (status in ('pending','contacted','accepted','rejected'))
);

-- Indexes
create index on public.inscriptions (created_at desc);
create index on public.inscriptions (status);
create index on public.inscriptions (cycle);

-- RLS: nobody can read from the frontend (only service role via edge function)
alter table public.inscriptions enable row level security;
