-- Allow resources hosted on the app's own production domain.
create or replace function public.is_approved_external_url(input text)
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
        'operacao-enem-2026.netlify.app',
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
