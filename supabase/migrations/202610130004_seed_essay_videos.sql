insert into public.essay_videos (plan_version_id, video_number, title, duration_minutes, scheduled_date, practice_task, video_url, playlist_index, verification_status, source)
select p.id, x.video_number, x.title, x.duration_minutes, x.scheduled_date, x.practice_task, x.video_url, x.playlist_index, x.verification_status, x.source
from jsonb_to_recordset($seed$[
  {
    "video_number": 1,
    "title": "Tentando tirar 3000 na Redação com Milla Borges (três temas ao mesmo tempo)",
    "duration_minutes": 213,
    "scheduled_date": "2026-10-13",
    "practice_task": "mapear tema, tese e repertório",
    "video_url": "https://www.youtube.com/watch?v=zXGrzS1jK5o",
    "playlist_index": 1,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 2,
    "title": "Nunca mais perca ponto na COMPETÊNCIA 1 da Redação ENEM",
    "duration_minutes": 148,
    "scheduled_date": "2026-10-15",
    "practice_task": "criar checklist da Competência 1",
    "video_url": "https://www.youtube.com/watch?v=JieTN96XwrU",
    "playlist_index": 2,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 3,
    "title": "Não vou desistir de tirar 1000 na Redação com a Milla Borges (agora vai)",
    "duration_minutes": 123,
    "scheduled_date": "2026-10-17",
    "practice_task": "comparar duas teses e escolher uma",
    "video_url": "https://www.youtube.com/watch?v=BqAl370-Ues",
    "playlist_index": 3,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 4,
    "title": "Tentando tirar 1000 na Redação com a Milla Borges",
    "duration_minutes": 190,
    "scheduled_date": "2026-10-19",
    "practice_task": "observar estrutura de redação nota alta",
    "video_url": "https://www.youtube.com/watch?v=1_gXyMjJoKU",
    "playlist_index": 4,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 5,
    "title": "Tentando tirar 1000 na Redação ENEM (professora 7x nota 1000)",
    "duration_minutes": 111,
    "scheduled_date": "2026-10-21",
    "practice_task": "escrever introdução em 12 min",
    "video_url": "https://www.youtube.com/watch?v=5mjRL5ZeS7I",
    "playlist_index": 5,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 6,
    "title": "Escreva comigo para REDAÇÃO ENEM | Aula #003 | Profª Milla Borges",
    "duration_minutes": 112,
    "scheduled_date": "2026-10-23",
    "practice_task": "escrever dois desenvolvimentos",
    "video_url": "https://www.youtube.com/watch?v=Fei09Xvy3yI",
    "playlist_index": 6,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 7,
    "title": "Escreva comigo para REDAÇÃO ENEM | Aula #002 | Profª Milla Borges",
    "duration_minutes": 148,
    "scheduled_date": "2026-10-26",
    "practice_task": "praticar proposta de intervenção",
    "video_url": "https://www.youtube.com/watch?v=1VxCWJyLbyk",
    "playlist_index": 7,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 8,
    "title": "E se o tema da REDAÇÃO ENEM for sobre APOSTAS? (aluno nota 1000 improvisando AO VIVO)",
    "duration_minutes": 16,
    "scheduled_date": "2026-10-29",
    "practice_task": "escrever uma redação completa",
    "video_url": "https://www.youtube.com/watch?v=tstulMtWuqc",
    "playlist_index": 8,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 9,
    "title": "Escreva comigo para REDAÇÃO ENEM | Aula #001 | Profª Milla Borges",
    "duration_minutes": 139,
    "scheduled_date": "2026-11-01",
    "practice_task": "corrigir por competências",
    "video_url": "https://www.youtube.com/watch?v=SIOL2KWBkXs",
    "playlist_index": 9,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  },
  {
    "video_number": 10,
    "title": "[REDAÇÃO NOTA 1000] Leio a minha redação e mostro como você pode fazer igual",
    "duration_minutes": 25,
    "scheduled_date": "2026-11-04",
    "practice_task": "reescrever os trechos frágeis",
    "video_url": "https://www.youtube.com/watch?v=-xq1SMpanBk",
    "playlist_index": 10,
    "verification_status": "confirmed",
    "source": "Prompt_APP_Operacao_ENEM_2026.md + Operacao_ENEM_2026.pdf + Serie-Super-Aulas-Assaad.xlsx + links enviados pelo usuário"
  }
]$seed$::jsonb) as x(video_number smallint, title text, duration_minutes integer, scheduled_date date, practice_task text, video_url text, playlist_index smallint, verification_status text, source text)
cross join public.plan_versions p where p.version = 'operacao-enem-2026-v1'
on conflict (plan_version_id, video_number) do update set title = excluded.title, duration_minutes = excluded.duration_minutes, scheduled_date = excluded.scheduled_date, practice_task = excluded.practice_task, video_url = excluded.video_url, playlist_index = excluded.playlist_index, verification_status = excluded.verification_status, source = excluded.source;
