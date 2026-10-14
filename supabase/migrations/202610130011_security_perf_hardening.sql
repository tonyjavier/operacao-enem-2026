-- Hardening após advisory do Supabase: restringir a função de trigger,
-- evitar reavaliação de auth.uid() por linha e indexar chaves estrangeiras.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

do $$
declare
  pol record;
  command text;
begin
  for pol in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and coalesce(qual, '') || coalesce(with_check, '') like '%auth.uid()%'
  loop
    command := format('alter policy %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    if pol.qual is not null then
      command := command || format(' using (%s)', replace(pol.qual, 'auth.uid()', '(select auth.uid())'));
    end if;
    if pol.with_check is not null then
      command := command || format(' with check (%s)', replace(pol.with_check, 'auth.uid()', '(select auth.uid())'));
    end if;
    execute command;
  end loop;
end;
$$;

create index if not exists day_tasks_resource_id_idx on public.day_tasks (resource_id);
create index if not exists day_tasks_lesson_id_idx on public.day_tasks (lesson_id);
create index if not exists day_tasks_essay_video_id_idx on public.day_tasks (essay_video_id);
create index if not exists user_error_notes_schedule_day_id_idx on public.user_error_notes (schedule_day_id);
create index if not exists user_error_notes_lesson_id_idx on public.user_error_notes (lesson_id);
create index if not exists user_essay_entries_schedule_day_id_idx on public.user_essay_entries (schedule_day_id);
create index if not exists user_essay_video_progress_video_id_idx on public.user_essay_video_progress (essay_video_id);
create index if not exists user_lesson_progress_lesson_id_idx on public.user_lesson_progress (lesson_id);
create index if not exists user_question_sessions_schedule_day_id_idx on public.user_question_sessions (schedule_day_id);
create index if not exists user_question_sessions_day_task_id_idx on public.user_question_sessions (day_task_id);
create index if not exists user_task_progress_day_task_id_idx on public.user_task_progress (day_task_id);
