-- Operação ENEM 2026 — schema inicial
-- Runtime truth: conteúdo/progresso residem no Supabase; somente a sessão Auth persiste no navegador.

create table public.plan_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  starts_on date not null,
  ends_on date not null,
  source text not null,
  published_at timestamptz not null default now(),
  is_active boolean not null default false,
  constraint plan_versions_dates_check check (starts_on <= ends_on)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  url text,
  purpose text not null,
  resource_type text not null check (resource_type in ('site', 'playlist', 'material', 'reference', 'video')),
  verification_status text not null check (verification_status in ('confirmed', 'estimated', 'pending')),
  source text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  plan_version_id uuid not null references public.plan_versions(id) on delete cascade,
  lesson_number smallint not null check (lesson_number between 1 and 32),
  title text not null,
  subject text not null,
  priority text check (priority in ('A', 'B', 'C')),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  duration_label text,
  scheduled_date date,
  video_url text,
  playlist_url text,
  playlist_index smallint,
  availability text not null check (availability in ('available', 'private', 'unavailable', 'pending')),
  is_extra boolean not null default false,
  verification_status text not null check (verification_status in ('confirmed', 'estimated', 'pending')),
  source text not null,
  unique (plan_version_id, lesson_number)
);

create table public.essay_videos (
  id uuid primary key default gen_random_uuid(),
  plan_version_id uuid not null references public.plan_versions(id) on delete cascade,
  video_number smallint not null check (video_number between 1 and 10),
  title text not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  scheduled_date date not null,
  practice_task text not null,
  video_url text not null,
  playlist_index smallint not null,
  verification_status text not null default 'confirmed' check (verification_status in ('confirmed', 'estimated', 'pending')),
  source text not null,
  unique (plan_version_id, video_number)
);

create table public.schedule_days (
  id uuid primary key default gen_random_uuid(),
  plan_version_id uuid not null references public.plan_versions(id) on delete cascade,
  study_date date not null,
  weekday text not null,
  phase text not null check (phase in ('main_plan', 'final_review', 'between_exams', 'exam')),
  day_type text not null check (day_type in ('study', 'review', 'exam_1', 'between_exams', 'exam_2')),
  focus_subject text not null,
  objective text not null,
  new_question_goal integer check (new_question_goal is null or new_question_goal >= 0),
  question_range text,
  source_payload jsonb not null default '{}'::jsonb,
  source text not null,
  unique (plan_version_id, study_date)
);

create table public.day_tasks (
  id uuid primary key default gen_random_uuid(),
  schedule_day_id uuid not null references public.schedule_days(id) on delete cascade,
  position smallint not null check (position > 0),
  kind text not null check (kind in ('question', 'lesson', 'essay_video', 'microtraining', 'practice', 'review', 'final_review', 'between_exams', 'exam')),
  title text not null,
  description text not null default '',
  resource_id uuid references public.resources(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  essay_video_id uuid references public.essay_videos(id) on delete set null,
  target_min integer check (target_min is null or target_min >= 0),
  target_max integer check (target_max is null or target_max >= 0),
  verification_status text not null default 'confirmed' check (verification_status in ('confirmed', 'estimated', 'pending')),
  unique (schedule_day_id, position),
  constraint day_tasks_range_check check (target_min is null or target_max is null or target_min <= target_max)
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_lesson_progress (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  watched_seconds integer not null default 0 check (watched_seconds >= 0),
  resume_position_seconds integer check (resume_position_seconds is null or resume_position_seconds >= 0),
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.user_essay_video_progress (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  essay_video_id uuid not null references public.essay_videos(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, essay_video_id)
);

create table public.user_task_progress (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day_task_id uuid not null references public.day_tasks(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, day_task_id)
);

create table public.user_question_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  schedule_day_id uuid not null references public.schedule_days(id) on delete cascade,
  day_task_id uuid references public.day_tasks(id) on delete set null,
  operation_id uuid not null default gen_random_uuid(),
  new_count integer not null default 0 check (new_count >= 0),
  redo_count integer not null default 0 check (redo_count >= 0),
  correction_done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, operation_id)
);

create table public.user_error_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  schedule_day_id uuid references public.schedule_days(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  subject text not null,
  topic text not null,
  prompt text,
  error_type text not null check (error_type in ('knowledge', 'interpretation', 'calculation', 'concept', 'inattention', 'time', 'other')),
  correction_note text not null,
  review_due_on date,
  reviewed_at timestamptz,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_essay_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  schedule_day_id uuid references public.schedule_days(id) on delete set null,
  completed_on date not null default current_date,
  theme text,
  is_timed boolean not null default false,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  thesis text,
  difficulties text,
  argumentation text,
  cohesion text,
  language text,
  intervention text,
  rewrite_notes text,
  competency_scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schedule_days_date_idx on public.schedule_days (study_date);
create index day_tasks_day_position_idx on public.day_tasks (schedule_day_id, position);
create index lessons_plan_date_idx on public.lessons (plan_version_id, scheduled_date, lesson_number);
create index user_question_sessions_owner_day_idx on public.user_question_sessions (user_id, schedule_day_id, created_at desc);
create index user_error_notes_owner_review_idx on public.user_error_notes (user_id, review_due_on);
create index user_essay_entries_owner_date_idx on public.user_essay_entries (user_id, completed_on desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger user_lesson_progress_set_updated_at before update on public.user_lesson_progress
for each row execute function public.set_updated_at();
create trigger user_essay_video_progress_set_updated_at before update on public.user_essay_video_progress
for each row execute function public.set_updated_at();
create trigger user_task_progress_set_updated_at before update on public.user_task_progress
for each row execute function public.set_updated_at();
create trigger user_error_notes_set_updated_at before update on public.user_error_notes
for each row execute function public.set_updated_at();
create trigger user_essay_entries_set_updated_at before update on public.user_essay_entries
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.plan_versions enable row level security;
alter table public.resources enable row level security;
alter table public.lessons enable row level security;
alter table public.essay_videos enable row level security;
alter table public.schedule_days enable row level security;
alter table public.day_tasks enable row level security;

create policy plan_versions_authenticated_read on public.plan_versions for select to authenticated using (auth.uid() is not null);
create policy resources_authenticated_read on public.resources for select to authenticated using (auth.uid() is not null);
create policy lessons_authenticated_read on public.lessons for select to authenticated using (auth.uid() is not null);
create policy essay_videos_authenticated_read on public.essay_videos for select to authenticated using (auth.uid() is not null);
create policy schedule_days_authenticated_read on public.schedule_days for select to authenticated using (auth.uid() is not null);
create policy day_tasks_authenticated_read on public.day_tasks for select to authenticated using (auth.uid() is not null);

grant select on public.plan_versions, public.resources, public.lessons, public.essay_videos, public.schedule_days, public.day_tasks to authenticated;
revoke all on public.plan_versions, public.resources, public.lessons, public.essay_videos, public.schedule_days, public.day_tasks from anon;

alter table public.profiles enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.user_essay_video_progress enable row level security;
alter table public.user_task_progress enable row level security;
alter table public.user_question_sessions enable row level security;
alter table public.user_error_notes enable row level security;
alter table public.user_essay_entries enable row level security;

grant select, insert, update, delete on public.profiles, public.user_lesson_progress, public.user_essay_video_progress, public.user_task_progress, public.user_question_sessions, public.user_error_notes, public.user_essay_entries to authenticated;
revoke all on public.profiles, public.user_lesson_progress, public.user_essay_video_progress, public.user_task_progress, public.user_question_sessions, public.user_error_notes, public.user_essay_entries from anon;

create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy profiles_delete_own on public.profiles for delete to authenticated using (auth.uid() = user_id);

create policy user_lesson_progress_select_own on public.user_lesson_progress for select to authenticated using (auth.uid() = user_id);
create policy user_lesson_progress_insert_own on public.user_lesson_progress for insert to authenticated with check (auth.uid() = user_id);
create policy user_lesson_progress_update_own on public.user_lesson_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_lesson_progress_delete_own on public.user_lesson_progress for delete to authenticated using (auth.uid() = user_id);

create policy user_essay_video_progress_select_own on public.user_essay_video_progress for select to authenticated using (auth.uid() = user_id);
create policy user_essay_video_progress_insert_own on public.user_essay_video_progress for insert to authenticated with check (auth.uid() = user_id);
create policy user_essay_video_progress_update_own on public.user_essay_video_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_essay_video_progress_delete_own on public.user_essay_video_progress for delete to authenticated using (auth.uid() = user_id);

create policy user_task_progress_select_own on public.user_task_progress for select to authenticated using (auth.uid() = user_id);
create policy user_task_progress_insert_own on public.user_task_progress for insert to authenticated with check (auth.uid() = user_id);
create policy user_task_progress_update_own on public.user_task_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_task_progress_delete_own on public.user_task_progress for delete to authenticated using (auth.uid() = user_id);

create policy user_question_sessions_select_own on public.user_question_sessions for select to authenticated using (auth.uid() = user_id);
create policy user_question_sessions_insert_own on public.user_question_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy user_question_sessions_update_own on public.user_question_sessions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_question_sessions_delete_own on public.user_question_sessions for delete to authenticated using (auth.uid() = user_id);

create policy user_error_notes_select_own on public.user_error_notes for select to authenticated using (auth.uid() = user_id);
create policy user_error_notes_insert_own on public.user_error_notes for insert to authenticated with check (auth.uid() = user_id);
create policy user_error_notes_update_own on public.user_error_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_error_notes_delete_own on public.user_error_notes for delete to authenticated using (auth.uid() = user_id);

create policy user_essay_entries_select_own on public.user_essay_entries for select to authenticated using (auth.uid() = user_id);
create policy user_essay_entries_insert_own on public.user_essay_entries for insert to authenticated with check (auth.uid() = user_id);
create policy user_essay_entries_update_own on public.user_essay_entries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_essay_entries_delete_own on public.user_essay_entries for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('error-attachments', 'error-attachments', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy error_attachments_select_own on storage.objects for select to authenticated
using (bucket_id = 'error-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy error_attachments_insert_own on storage.objects for insert to authenticated
with check (bucket_id = 'error-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy error_attachments_update_own on storage.objects for update to authenticated
using (bucket_id = 'error-attachments' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'error-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy error_attachments_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'error-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
