-- Keep per-user progress internally consistent and prevent references crossing plan versions.

alter table public.user_task_progress
  add constraint user_task_progress_completion_timestamp_consistent
  check (is_completed = (completed_at is not null)) not valid;
alter table public.user_task_progress
  validate constraint user_task_progress_completion_timestamp_consistent;

alter table public.user_lesson_progress
  add constraint user_lesson_progress_completion_timestamp_consistent
  check ((status = 'completed') = (completed_at is not null)) not valid;
alter table public.user_lesson_progress
  validate constraint user_lesson_progress_completion_timestamp_consistent;

alter table public.user_essay_video_progress
  add constraint user_essay_video_progress_completion_timestamp_consistent
  check ((status = 'completed') = (completed_at is not null)) not valid;
alter table public.user_essay_video_progress
  validate constraint user_essay_video_progress_completion_timestamp_consistent;

create or replace function public.validate_lesson_progress_duration()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  max_duration integer;
begin
  select l.duration_seconds into max_duration
  from public.lessons as l
  where l.id = new.lesson_id;

  if max_duration is not null then
    if new.resume_position_seconds is not null and new.resume_position_seconds > max_duration then
      raise exception 'Resume position exceeds lesson duration.' using errcode = '23514';
    end if;
    if new.watched_seconds > max_duration then
      raise exception 'Watched time exceeds lesson duration.' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.validate_lesson_progress_duration() from public, anon;
grant execute on function public.validate_lesson_progress_duration() to authenticated, service_role;

drop trigger if exists user_lesson_progress_duration_guard on public.user_lesson_progress;
create trigger user_lesson_progress_duration_guard
before insert or update of lesson_id, resume_position_seconds, watched_seconds
on public.user_lesson_progress
for each row execute function public.validate_lesson_progress_duration();

create or replace function public.enforce_day_task_version_match()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
declare
  schedule_version uuid;
  resource_version uuid;
  lesson_version uuid;
  essay_version uuid;
begin
  select d.plan_version_id, r.plan_version_id, l.plan_version_id, e.plan_version_id
  into schedule_version, resource_version, lesson_version, essay_version
  from public.schedule_days as d
  left join public.resources as r on r.id = new.resource_id
  left join public.lessons as l on l.id = new.lesson_id
  left join public.essay_videos as e on e.id = new.essay_video_id
  where d.id = new.schedule_day_id;

  if not found then
    return new; -- The foreign key reports a missing schedule day.
  end if;
  if new.resource_id is not null and resource_version is distinct from schedule_version then
    raise exception 'Day task resource must belong to the schedule day plan version.' using errcode = '23514';
  end if;
  if new.lesson_id is not null and lesson_version is distinct from schedule_version then
    raise exception 'Day task lesson must belong to the schedule day plan version.' using errcode = '23514';
  end if;
  if new.essay_video_id is not null and essay_version is distinct from schedule_version then
    raise exception 'Day task essay video must belong to the schedule day plan version.' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_day_task_version_match() from public, anon;
grant execute on function public.enforce_day_task_version_match() to authenticated, service_role;

drop trigger if exists day_tasks_version_match_guard on public.day_tasks;
create trigger day_tasks_version_match_guard
before insert or update of schedule_day_id, resource_id, lesson_id, essay_video_id
on public.day_tasks
for each row execute function public.enforce_day_task_version_match();
