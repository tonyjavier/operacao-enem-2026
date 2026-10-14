insert into public.day_tasks (schedule_day_id, position, kind, title, description, resource_id, lesson_id, essay_video_id, target_min, target_max, verification_status)
select d.id, x.position, x.kind, x.title, x.description, r.id, l.id, e.id, x.target_min, x.target_max, x.verification_status
from jsonb_to_recordset($seed$[
  {
    "study_date": "2026-11-03",
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
    "study_date": "2026-11-03",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 22",
    "description": "Tudo de Estequiometria para o ENEM 2026 (didática mágica + 100 questões)",
    "lesson_number": 22,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-03",
    "position": 3,
    "kind": "lesson",
    "title": "Assistir aula 26",
    "description": "TUDO de ELETROMAGNETISMO para o ENEM 2026 (mas tu vai entender)",
    "lesson_number": 26,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-03",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-03",
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
    "study_date": "2026-11-03",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-04",
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
    "study_date": "2026-11-04",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 23",
    "description": "Ecologia AVANÇADA pro ENEM 2026 - Gráficos e análises profundas (didática mágica)",
    "lesson_number": 23,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-04",
    "position": 3,
    "kind": "lesson",
    "title": "Assistir aula 27",
    "description": "TUDO de HORMÔNIOS FEMININOS e CICLO MENSTRUAL pro ENEM 2026",
    "lesson_number": 27,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-04",
    "position": 4,
    "kind": "essay_video",
    "title": "Assistir vídeo de Redação 10",
    "description": "[REDAÇÃO NOTA 1000] Leio a minha redação e mostro como você pode fazer igual",
    "essay_video_number": 10,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-04",
    "position": 5,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "conclusão",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-04",
    "position": 6,
    "kind": "practice",
    "title": "Questões e correção",
    "description": "10–15 questões de livros/PDFs + correção; não usar apostilas PreparaENEM.",
    "resource_slug": null,
    "target_min": 10,
    "target_max": 15,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-04",
    "position": 7,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-05",
    "position": 1,
    "kind": "question",
    "title": "Questões de Interdisciplinar",
    "description": "30 questões novas no Hospital Questiona. Corrija e classifique os erros.",
    "resource_slug": "hospital-questiona",
    "target_min": 30,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-05",
    "position": 2,
    "kind": "lesson",
    "title": "Assistir aula 24",
    "description": "Título pendente",
    "lesson_number": 24,
    "verification_status": "pending"
  },
  {
    "study_date": "2026-11-05",
    "position": 3,
    "kind": "lesson",
    "title": "Assistir aula 28",
    "description": "TUDO de ANÁLISE COMBINATÓRIA em apenas 1 hora (ENEM 2026, didática lendária)",
    "lesson_number": 28,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-05",
    "position": 4,
    "kind": "microtraining",
    "title": "Microtreino de Redação",
    "description": "Microtreino de 10–20 min: reescrever uma frase ruim ou revisar uma proposta de intervenção.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-05",
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
    "study_date": "2026-11-05",
    "position": 6,
    "kind": "review",
    "title": "Revisar erros recentes",
    "description": "Revisar erros de 24–48 h atrás; se não houver, refazer 5 questões marcadas.",
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-06",
    "position": 1,
    "kind": "final_review",
    "title": "Roteiro de revisão final",
    "description": "Revisar o caderno de erros; padrões de Matemática mais frágeis; estrutura de Redação com 1 introdução e 1 conclusão. Separar documento, cartão, caneta transparente e lanche.",
    "target_min": 20,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-07",
    "position": 1,
    "kind": "final_review",
    "title": "Roteiro de revisão final",
    "description": "Revisão ativa curta; ler o checklist das cinco competências; nada de assunto novo pesado",
    "target_min": 10,
    "target_max": 20,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-08",
    "position": 1,
    "kind": "exam",
    "title": "Dia de prova — confira as orientações",
    "description": "Linguagens, Ciências Humanas e Redação. portões 12h–13h, início 13h30, término 19h (Brasília). documento original com foto, caneta preta transparente, cartão de confirmação, lanche.",
    "target_min": null,
    "target_max": null,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-09",
    "position": 1,
    "kind": "between_exams",
    "title": "Revisão de Matemática",
    "description": "Padrões + 25 questões, corrigir e classificar erros",
    "target_min": 25,
    "target_max": 35,
    "verification_status": "confirmed"
  }
]$seed$::jsonb) as x(study_date date, position smallint, kind text, title text, description text, resource_slug text, lesson_number smallint, essay_video_number smallint, target_min integer, target_max integer, verification_status text)
join public.schedule_days d on d.study_date = x.study_date
join public.plan_versions p on p.id = d.plan_version_id and p.version = 'operacao-enem-2026-v1'
left join public.resources r on r.slug = x.resource_slug
left join public.lessons l on l.plan_version_id = p.id and l.lesson_number = x.lesson_number
left join public.essay_videos e on e.plan_version_id = p.id and e.video_number = x.essay_video_number
on conflict (schedule_day_id, position) do update set kind = excluded.kind, title = excluded.title, description = excluded.description, resource_id = excluded.resource_id, lesson_id = excluded.lesson_id, essay_video_id = excluded.essay_video_id, target_min = excluded.target_min, target_max = excluded.target_max, verification_status = excluded.verification_status;
