-- Keep client-side guards enforceable against direct API requests.
create or replace function public.is_valid_essay_competency_scores(scores jsonb)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select case
    when scores is null or pg_catalog.jsonb_typeof(scores) <> 'object' then false
    else not exists (
      select 1
      from pg_catalog.jsonb_each(scores) as score(key, value)
      where score.key not in ('1', '2', '3', '4', '5')
        or case
          when pg_catalog.jsonb_typeof(score.value) = 'number'
            then (score.value::text)::numeric < 0
              or (score.value::text)::numeric > 200
              or (score.value::text)::numeric <> pg_catalog.trunc((score.value::text)::numeric)
          else true
        end
    )
  end;
$$;

revoke all on function public.is_valid_essay_competency_scores(jsonb) from public, anon;
grant execute on function public.is_valid_essay_competency_scores(jsonb) to authenticated, service_role;

alter table public.user_question_sessions
  add constraint user_question_sessions_at_least_one_question
  check (new_count > 0 or redo_count > 0);

alter table public.user_essay_entries
  add constraint user_essay_entries_competency_scores_valid
  check (public.is_valid_essay_competency_scores(competency_scores));
