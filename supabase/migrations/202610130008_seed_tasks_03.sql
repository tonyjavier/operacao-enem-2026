insert into public.day_tasks (schedule_day_id, position, kind, title, description, resource_id, lesson_id, essay_video_id, target_min, target_max, verification_status)
select d.id, x.position, x.kind, x.title, x.description, r.id, l.id, e.id, x.target_min, x.target_max, x.verification_status
from jsonb_to_recordset($seed$[
  {
    "study_date": "2026-10-27",
    "position": 1,
    "kind": "question",
    "title": "Questões de História",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-27",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 15",
    "description": "TUDO de HISTÓRIA DO BRASIL pro ENEM 2026 (teoria + questões)",
    "lesson_number": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-27",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-27",
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
    "study_date": "2026-10-27",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-28",
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
    "study_date": "2026-10-28",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 16",
    "description": "TUDO de LITERATURA e VANGUARDAS EUROPÉIAS pro ENEM 2026 (OBRIGATÓRIO SABER)",
    "lesson_number": 16,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-28",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-28",
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
    "study_date": "2026-10-28",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-29",
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
    "study_date": "2026-10-29",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 17",
    "description": "TUDO de GEOMETRIA PLANA E ESPACIAL pro ENEM 2026 (GANHE 10 ACERTOS NA PROVA)",
    "lesson_number": 17,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-29",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 8",
    "description": "E se o tema da REDAÇÃO ENEM for sobre APOSTAS? (aluno nota 1000 improvisando AO VIVO)",
    "essay_video_number": 8,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-29",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "introdução",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-29",
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
    "study_date": "2026-10-29",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-30",
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
    "study_date": "2026-10-30",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 18",
    "description": "TUDO DE TRIGONOMETRIA PRO ENEM 2026 (DIDÁTICA ALUCINANTE, MELHOR AULA DO YOUTUBE)",
    "lesson_number": 18,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-30",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-30",
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
    "study_date": "2026-10-30",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-31",
    "position": 1,
    "kind": "question",
    "title": "Questões de Linguagens",
    "description": "35 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 35,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-31",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 19",
    "description": "TUDO sobre FUNÇÕES DA LINGUAGEM pro ENEM - Referencial, conativa, metalinguística, poética, fática",
    "lesson_number": 19,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-31",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-31",
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
    "study_date": "2026-10-31",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-01",
    "position": 1,
    "kind": "question",
    "title": "Questões de Química",
    "description": "35 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 35,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-01",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 20",
    "description": "A melhor aula de NOX da sua vida (DESBLOQUEIE SUA INTELIGÊNCIA QUÍMICA)",
    "lesson_number": 20,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-01",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 9",
    "description": "Escreva comigo para REDAÇÃO ENEM | Aula #001 | Profª Milla Borges",
    "essay_video_number": 9,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-01",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "desenvolvimento",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-01",
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
    "study_date": "2026-11-01",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-02",
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
    "study_date": "2026-11-02",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 21",
    "description": "LEIS DE NEWTON E DINÂMICA (DIDÁTICA que GRUDA NA MENTE)",
    "lesson_number": 21,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-02",
    "position": 3,
    "kind": "lesson",
    "title": "Assistir aula 25",
    "description": "[GRÁTIS] Aprenda TUDO de GEOGRAFIA AGRÁRIA para o Enem 2026 com este vídeo",
    "lesson_number": 25,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-02",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-02",
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
    "study_date": "2026-11-02",
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
