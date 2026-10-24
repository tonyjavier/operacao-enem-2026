create or replace function public.sync_user_personal_task_completion()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.is_completed then
    new.completed_at := coalesce(new.completed_at, pg_catalog.statement_timestamp());
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_user_personal_task_completion() from public, anon;
grant execute on function public.sync_user_personal_task_completion() to authenticated, service_role;

drop trigger if exists user_personal_tasks_completion_guard on public.user_personal_tasks;
create trigger user_personal_tasks_completion_guard
before insert or update of is_completed, completed_at
on public.user_personal_tasks
for each row execute function public.sync_user_personal_task_completion();
