insert into public.day_tasks (schedule_day_id, position, kind, title, description, resource_id, lesson_id, essay_video_id, target_min, target_max, verification_status)
select d.id, x.position, x.kind, x.title, x.description, r.id, l.id, e.id, x.target_min, x.target_max, x.verification_status
from jsonb_to_recordset($seed$[
  {
    "study_date": "2026-11-10",
    "position": 1,
    "kind": "between_exams",
    "title": "Revisão de Física",
    "description": "Cinemática e Newton + 20 questões",
    "target_min": 20,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-11",
    "position": 1,
    "kind": "between_exams",
    "title": "Revisão de Química",
    "description": "Química geral e NOX + 20 questões",
    "target_min": 20,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-12",
    "position": 1,
    "kind": "between_exams",
    "title": "Revisão de Biologia",
    "description": "Ecologia e genética + 20 questões",
    "target_min": 20,
    "target_max": 30,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-13",
    "position": 1,
    "kind": "between_exams",
    "title": "Revisão de Matemática",
    "description": "Bateria mista cronometrada + refação",
    "target_min": 25,
    "target_max": 35,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-14",
    "position": 1,
    "kind": "between_exams",
    "title": "Revisão de Natureza",
    "description": "Revisão leve dos erros e documentos; sem conteúdo pesado à noite",
    "target_min": 10,
    "target_max": 20,
    "verification_status": "confirmed"
  },
  {
    "study_date": "2026-11-15",
    "position": 1,
    "kind": "exam",
    "title": "Dia de prova — confira as orientações",
    "description": "Ciências da Natureza e Matemática. portões 12h–13h, início 13h30, término 18h30 (Brasília). começar por itens com leitura clara, marcar os longos, controlar o tempo e não insistir em uma questão que consome energia demais.",
    "target_min": null,
    "target_max": null,
    "verification_status": "confirmed"
  }
]$seed$::jsonb) as x(study_date date, position smallint, kind text, title text, description text, resource_slug text, lesson_number smallint, essay_video_number smallint, target_min integer, target_max integer, verification_status text)
join public.schedule_days d on d.study_date = x.study_date
join public.plan_versions p on p.id = d.plan_version_id and p.version = 'operacao-enem-2026-v1'
left join public.resources r on r.slug = x.resource_slug
left join public.lessons l on l.plan_version_id = p.id and l.lesson_number = x.lesson_number
left join public.essay_videos e on e.plan_version_id = p.id and e.video_number = x.essay_video_number
on conflict (schedule_day_id, position) do update set kind = excluded.kind, title = excluded.title, description = excluded.description, resource_id = excluded.resource_id, lesson_id = excluded.lesson_id, essay_video_id = excluded.essay_video_id, target_min = excluded.target_min, target_max = excluded.target_max, verification_status = excluded.verification_status;
