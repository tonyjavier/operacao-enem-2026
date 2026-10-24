alter table public.user_personal_tasks
  add column completed_at timestamptz;

update public.user_personal_tasks
set completed_at = created_at
where is_completed and completed_at is null;

alter table public.user_personal_tasks
  add constraint user_personal_tasks_completion_timestamp_check
  check ((is_completed and completed_at is not null) or (not is_completed and completed_at is null));
