-- A migration inicial já foi aplicada: esta migração preserva os registros atuais,
-- associa recursos à versão ativa e protege versões/URLs contra estados inválidos.

do $$
begin
  if (select count(*) from public.plan_versions where is_active) > 1 then
    raise exception 'Há mais de uma versão ativa do cronograma; resolva a ambiguidade antes de continuar.';
  end if;
end;
$$;

create unique index plan_versions_one_active_idx
  on public.plan_versions (is_active)
  where is_active;

alter table public.resources
  add column plan_version_id uuid references public.plan_versions(id) on delete cascade;

update public.resources r
set plan_version_id = p.id
from public.plan_versions p
where p.is_active
  and r.plan_version_id is null;

alter table public.resources
  alter column plan_version_id set not null;

alter table public.resources
  drop constraint resources_slug_key;

alter table public.resources
  add constraint resources_plan_version_slug_key unique (plan_version_id, slug);

create function public.is_approved_external_url(input text)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $function$
  select case
    when input is null then true
    when lower(input) not like 'https://%' then false
    when input ~ '^https://[^/]*@' then false
    else coalesce(
      lower(substring(input from '^https://([^/?#]+)')) = any (array[
        'hospital.questiona.com.br',
        'lucasdorioverde.mt.gov.br',
        'palavraschavenemrenan.link',
        'questoespadroesmatematicaenem.lovable.app',
        'www.gov.br',
        'www.youtube.com',
        'youtu.be'
      ]::text[]),
      false
    )
  end;
$function$;

revoke execute on function public.is_approved_external_url(text) from public, anon;
grant execute on function public.is_approved_external_url(text) to authenticated;

alter table public.resources
  add constraint resources_url_allowlist_check
  check (public.is_approved_external_url(url));

alter table public.lessons
  add constraint lessons_video_url_allowlist_check
  check (public.is_approved_external_url(video_url)),
  add constraint lessons_playlist_url_allowlist_check
  check (public.is_approved_external_url(playlist_url));

alter table public.essay_videos
  add constraint essay_videos_url_allowlist_check
  check (public.is_approved_external_url(video_url));
