insert into public.day_tasks (schedule_day_id, position, kind, title, description, resource_id, lesson_id, essay_video_id, target_min, target_max, verification_status)
select d.id, x.position, x.kind, x.title, x.description, r.id, l.id, e.id, x.target_min, x.target_max, x.verification_status
from jsonb_to_recordset($seed$[
  {
    "study_date": "2026-10-13",
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
    "study_date": "2026-10-13",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 1",
    "description": "[GRÁTIS] Eu ensino TODA a MATEMÁTICA do ENEM para você em 12 horas",
    "lesson_number": 1,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-13",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 1",
    "description": "Tentando tirar 3000 na Redação com Milla Borges (três temas ao mesmo tempo)",
    "essay_video_number": 1,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-13",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "tese",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-13",
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
    "study_date": "2026-10-13",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-14",
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
    "study_date": "2026-10-14",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 2",
    "description": "TODA A FÍSICA DO ENEM 2026 em 12 horas",
    "lesson_number": 2,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-14",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-14",
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
    "study_date": "2026-10-14",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-15",
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
    "study_date": "2026-10-15",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 3",
    "description": "TUDO de Matemática do Ensino FUNDAMENTAL pro ENEM 2026 (pra quem tem MUITA DIFICULDADE)",
    "lesson_number": 3,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-15",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 2",
    "description": "Nunca mais perca ponto na COMPETÊNCIA 1 da Redação ENEM",
    "essay_video_number": 2,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-15",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "introdução",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-15",
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
    "study_date": "2026-10-15",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-16",
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
    "study_date": "2026-10-16",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 4",
    "description": "Curso completo de CINEMÁTICA pro ENEM 2026 (didática MUITO superior)",
    "lesson_number": 4,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-16",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-16",
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
    "study_date": "2026-10-16",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-17",
    "position": 1,
    "kind": "question",
    "title": "Questões de Biologia",
    "description": "35 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 35,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-17",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 5",
    "description": "[INSANO] Tudo de BIOLOGIA para o ENEM está neste vídeo GRATUITO",
    "lesson_number": 5,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-17",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 3",
    "description": "Não vou desistir de tirar 1000 na Redação com a Milla Borges (agora vai)",
    "essay_video_number": 3,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-17",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "desenvolvimento",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-17",
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
    "study_date": "2026-10-17",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-18",
    "position": 1,
    "kind": "question",
    "title": "Questões de Biologia",
    "description": "35 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 35,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-18",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 6",
    "description": "TUDO DE CITOLOGIA PARA O ENEM 2026 | DIDÁTICA MÁGICA",
    "lesson_number": 6,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-18",
    "position": 3,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-18",
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
    "study_date": "2026-10-18",
    "position": 5,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-19",
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
    "study_date": "2026-10-19",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 7",
    "description": "TUDO de GENÉTICA pro ENEM 2026 (DIDÁTICA que GRUDA NA MENTE)",
    "lesson_number": 7,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-19",
    "position": 3,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 4",
    "description": "Tentando tirar 1000 na Redação com a Milla Borges",
    "essay_video_number": 4,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-19",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "conclusão",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-10-19",
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
    "study_date": "2026-10-19",
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
