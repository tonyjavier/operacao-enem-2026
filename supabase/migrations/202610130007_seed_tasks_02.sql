insert into public.day_tasks (schedule_day_id, position, kind, title, description, resource_id, lesson_id, essay_video_id, target_min, target_max, verification_status)
select d.id, x.position, x.kind, x.title, x.description, r.id, l.id, e.id, x.target_min, x.target_max, x.verification_status
from jsonb_to_recordset($seed$[
  {
    "study_date": "2026-10-20",
    "position": 1,
    "kind": "question",
    "title": "Questões de Biologia",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-20",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 8",
    "description": "Vacinas, imunologia, DNA, organelas e vírus pro ENEM 2026",
    "lesson_number": 8,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-20",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-20",
    "position": 4,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": null,
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-20",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-21",
    "position": 1,
    "kind": "question",
    "title": "Questões de Física",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-21",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 9",
    "description": "TUDO DE GEOGRAFIA FÍSICA PARA O ENEM 2026 (DIDÁTICA SUPREMA)",
    "lesson_number": 9,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-21",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 5",
    "description": "Tentando tirar 1000 na Redação ENEM (professora 7x nota 1000)",
    "essay_video_number": 5,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-21",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "proposta",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-21",
    "position": 5,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": null,
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-21",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-22",
    "position": 1,
    "kind": "question",
    "title": "Questões de Linguagens",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-22",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 10",
    "description": "FIGURAS DE LINGUAGEM PRO ENEM 2026 (a melhor aula do YouTube)",
    "lesson_number": 10,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-22",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-22",
    "position": 4,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": null,
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-22",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-23",
    "position": 1,
    "kind": "question",
    "title": "Questões de Matemática",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-23",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 11",
    "description": "TUDO de FUNÇÃO do PRIMEIRO GRAU pro ENEM 2026 (didática insana e muitas questões resolvidas)",
    "lesson_number": 11,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-23",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 6",
    "description": "Escreva comigo para REDAÇÃO ENEM | Aula #003 | Profª Milla Borges",
    "essay_video_number": 6,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-23",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "reescrita",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-23",
    "position": 5,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": "padroes-de-matematica",
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-23",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-24",
    "position": 1,
    "kind": "question",
    "title": "Questões de Filosofia",
    "description": "35 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 35,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-24",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 12",
    "description": "TUDO de FILOSOFIA para o ENEM 2026 (DIDÁTICA SUPERIOR)",
    "lesson_number": 12,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-24",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-24",
    "position": 4,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": null,
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-24",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-25",
    "position": 1,
    "kind": "question",
    "title": "Questões de Matemática",
    "description": "35 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 35,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-25",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 13",
    "description": "TUDO de LOGARITMO pro ENEM 2026 (didática INSANA, acertos garantidos)",
    "lesson_number": 13,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-25",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-25",
    "position": 4,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": "padroes-de-matematica",
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-25",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-26",
    "position": 1,
    "kind": "question",
    "title": "Questões de Química",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-26",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 14",
    "description": "TUDO de QUÍMICA GERAL pro ENEM 2026 (GANHE MUITOS ACERTOS)",
    "lesson_number": 14,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-26",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 7",
    "description": "Escreva comigo para REDAÇÃO ENEM | Aula #002 | Profª Milla Borges",
    "essay_video_number": 7,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-26",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "tese",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-26",
    "position": 5,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": null,
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-26",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  }
]$seed$::jsonb) as x(study_date date, position smallint, kind text, title text, description text, resource_slug text, lesson_number smallint, essay_video_number smallint, target_min integer, target_max integer, verification_status text)
join public.schedule_days d on d.study_date = x.study_date
join public.plan_versions p on p.id = d.plan_version_id and p.version = 'operacao-enem-2026-v1'
left join public.resources r on r.slug = x.resource_slug
left join public.lessons l on l.plan_version_id = p.id and l.lesson_number = x.lesson_number
left join public.essay_videos e on e.plan_version_id = p.id and e.video_number = x.essay_video_number
on conflict (schedule_day_id, position) do update set kind = excluded.kind, title = excluded.title, description = excluded.description, resource_id = excluded.resource_id, lesson_id = excluded.lesson_id, essay_video_id = excluded.essay_video_id, target_min = excluded.target_min, target_max = excluded.target_max, verification_status = excluded.verification_status;
