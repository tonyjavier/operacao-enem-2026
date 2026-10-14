-- Versioned seed from supplied prompt, PDF, workbook and user-provided video URLs.
insert into public.plan_versions (version, starts_on, ends_on, source, is_active) values ('operacao-enem-2026-v1', '2026-10-13', '2026-11-15', 'Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário', true)
on conflict (version) do update set starts_on = excluded.starts_on, ends_on = excluded.ends_on, source = excluded.source, is_active = true;

insert into public.resources (slug, name, url, purpose, resource_type, verification_status, source, sort_order)
select x.slug, x.name, x.url, x.purpose, x.resource_type, x.verification_status, x.source, x.sort_order
from jsonb_to_recordset($seed$[
  {
    "slug": "hospital-questiona",
    "name": "Hospital Questiona",
    "url": "https://hospital.questiona.com.br/login",
    "purpose": "Questões da manhã (05h35–07h00) e do almoço. Exige login; o app só abre o link e nunca guarda senha.",
    "resource_type": "site",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 1
  },
  {
    "slug": "super-aulas-assaad",
    "name": "Super Aulas Assaad",
    "url": "https://www.youtube.com/playlist?list=PLrZe9p7Ii564k52GBRVkn0tQFbMFzCOQo",
    "purpose": "28 aulas do cronograma + 4 aulas complementares (29–32) na biblioteca.",
    "resource_type": "playlist",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 2
  },
  {
    "slug": "redacao-na-pratica",
    "name": "Redação na Prática",
    "url": "https://www.youtube.com/playlist?list=PLrZe9p7Ii5653pXRhPB24v468whO_wixo",
    "purpose": "10 vídeos de Redação.",
    "resource_type": "playlist",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 3
  },
  {
    "slug": "padroes-de-matematica",
    "name": "Padrões de Matemática",
    "url": "https://questoespadroesmatematicaenem.lovable.app/",
    "purpose": "Noite: padrão, exemplo resolvido, questões, correção, registro, refação.",
    "resource_type": "site",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 4
  },
  {
    "slug": "palavras-chave-e-padroes",
    "name": "Palavras-chave e padrões",
    "url": "https://palavraschavenemrenan.link/",
    "purpose": "Revisão curta e recuperação ativa (2 PDFs de 214 e 124 páginas).",
    "resource_type": "site",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 5
  },
  {
    "slug": "aula-principal-de-humanas",
    "name": "Aula principal de Humanas",
    "url": "https://www.youtube.com/live/_wbtaX3VDt8?si=Of8w_Fn5uh-9GFyR",
    "purpose": "2 a 3 blocos de 25–35 min; 5 palavras-chave + 8 questões por bloco. Título e duração PENDENTES.",
    "resource_type": "video",
    "verification_status": "pending",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 6
  },
  {
    "slug": "video-complementar",
    "name": "Vídeo complementar",
    "url": "https://youtu.be/ADccHjAj7Jk?si=fLYuOr9T2pVxx3nL",
    "purpose": "Incluir só após conferir título; 6 questões depois. PENDENTE.",
    "resource_type": "video",
    "verification_status": "pending",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 7
  },
  {
    "slug": "apostilas-preparaenem-digital",
    "name": "Apostilas PreparaENEM Digital",
    "url": null,
    "purpose": "Só na escola. Nunca em tarefas noturnas.",
    "resource_type": "material",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 8
  },
  {
    "slug": "referencia-inep-mec-cronograma-do-enem",
    "name": "Inep/MEC: cronograma do ENEM",
    "url": "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/orientacoes/cronograma",
    "purpose": "Referência informativa listada no PDF.",
    "resource_type": "reference",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 20
  },
  {
    "slug": "referencia-inep-perguntas-frequentes",
    "name": "Inep: perguntas frequentes",
    "url": "https://www.gov.br/inep/pt-br/acesso-a-informacao/perguntas-frequentes/exame-nacional-do-ensino-medio-enem/",
    "purpose": "Referência informativa listada no PDF.",
    "resource_type": "reference",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 21
  },
  {
    "slug": "referencia-prefeitura-de-lucas-do-rio-verde-decreto-municipal-no-7-416-2026",
    "name": "Prefeitura de Lucas do Rio Verde (Decreto Municipal nº 7.416/2026)",
    "url": "https://lucasdorioverde.mt.gov.br/site/noticias/14436",
    "purpose": "Referência informativa listada no PDF.",
    "resource_type": "reference",
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário",
    "sort_order": 22
  }
]$seed$::jsonb) as x(slug text, name text, url text, purpose text, resource_type text, verification_status text, source text, sort_order integer)
on conflict (slug) do update set name = excluded.name, url = excluded.url, purpose = excluded.purpose, resource_type = excluded.resource_type, verification_status = excluded.verification_status, source = excluded.source, sort_order = excluded.sort_order;
