-- Serialize progress writes with duration edits and reject duration reductions below saved progress.

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
  where l.id = new.lesson_id
  for share;

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

create or replace function public.prevent_lesson_duration_below_saved_progress()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.duration_seconds is not distinct from old.duration_seconds or new.duration_seconds is null then
    return new;
  end if;

  if exists (
    select 1
    from public.user_lesson_progress as p
    where p.lesson_id = new.id
      and (
        p.watched_seconds > new.duration_seconds
        or (p.resume_position_seconds is not null and p.resume_position_seconds > new.duration_seconds)
      )
  ) then
    raise exception 'Lesson duration cannot be reduced below saved progress.' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.prevent_lesson_duration_below_saved_progress() from public, anon;
grant execute on function public.prevent_lesson_duration_below_saved_progress() to authenticated, service_role;

drop trigger if exists lessons_duration_progress_guard on public.lessons;
create trigger lessons_duration_progress_guard
before update of duration_seconds on public.lessons
for each row execute function public.prevent_lesson_duration_below_saved_progress();
