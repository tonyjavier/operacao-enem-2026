create table public.user_personal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  details text not null default '' check (char_length(details) <= 2000),
  due_on date,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_personal_tasks enable row level security;
revoke all on public.user_personal_tasks from anon;
grant select, insert, update, delete on public.user_personal_tasks to authenticated;

create policy user_personal_tasks_select_own on public.user_personal_tasks
  for select to authenticated using (auth.uid() = user_id);
create policy user_personal_tasks_insert_own on public.user_personal_tasks
  for insert to authenticated with check (auth.uid() = user_id);
create policy user_personal_tasks_update_own on public.user_personal_tasks
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_personal_tasks_delete_own on public.user_personal_tasks
  for delete to authenticated using (auth.uid() = user_id);
