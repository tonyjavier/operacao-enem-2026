alter table public.user_essay_entries
  add column if not exists is_complete boolean not null default false;
