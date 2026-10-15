import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Check, Clock3, ExternalLink, Search } from 'lucide-react';
import { Button, EmptyState, formatError, LoadingState, PageIntro, StatusTag } from '../../components/UI';
import { formatDate } from '../../lib/dates';
import { parseResumePositionSeconds } from '../../lib/lesson-progress';
import { getSupabase } from '../../lib/supabase';
import { openApprovedExternalUrl } from '../../lib/external-url';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import type { Lesson, PlanVersion, UserLessonProgress } from '../../lib/database.types';
import './lessons.css';

type LessonDraft = { resume: string; watchedMinutes: string; notes: string };
const statusLabels: Record<UserLessonProgress['status'], string> = { not_started: 'Não iniciada', in_progress: 'Em andamento', completed: 'Concluída' };

export function LessonsPage() {
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const requestedLesson = searchParams.get('lesson');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, UserLessonProgress>>({});
  const [drafts, setDrafts] = useState<Record<string, LessonDraft>>({});
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('Todas as áreas');
  const [filter, setFilter] = useState<'all' | 'planned' | 'extra' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const supabase = getSupabase();
        const { data: plan, error: planError } = await supabase.from('plan_versions').select('*').eq('is_active', true).maybeSingle();
        if (planError) throw planError;
        if (!plan) throw new Error('Não há cronograma ativo no Supabase.');
        const { data: lessonRows, error: lessonError } = await supabase.from('lessons').select('*').eq('plan_version_id', (plan as PlanVersion).id).order('lesson_number');
        if (lessonError) throw lessonError;
        const list = (lessonRows ?? []) as Lesson[];
        const { data: progressRows, error: progressError } = list.length ? await supabase.from('user_lesson_progress').select('*').in('lesson_id', list.map((lesson) => lesson.id)) : { data: [], error: null };
        if (progressError) throw progressError;
        if (!active) return;
        setLessons(list);
        const map = Object.fromEntries(((progressRows ?? []) as UserLessonProgress[]).map((row) => [row.lesson_id, row]));
        setProgress(map);
        setDrafts(Object.fromEntries(list.map((lesson) => { const row = map[lesson.id]; return [lesson.id, { resume: row?.resume_position_seconds?.toString() ?? '', watchedMinutes: row?.watched_seconds ? (row.watched_seconds / 60).toString() : '', notes: row?.notes ?? '' }]; })));
      } catch (e) { if (active) setError(formatError(e, 'Não foi possível carregar as aulas.')); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, []);

  const subjects = useMemo(() => ['Todas as áreas', ...Array.from(new Set(lessons.map((lesson) => lesson.subject))).sort((a, b) => a.localeCompare(b, 'pt-BR'))], [lessons]);
  const visibleLessons = useMemo(() => lessons.filter((lesson) => {
    const row = progress[lesson.id];
    const matchesFilter = filter === 'all' || (filter === 'planned' && !lesson.is_extra) || (filter === 'extra' && lesson.is_extra) || (filter === 'completed' && row?.status === 'completed');
    const matchesSubject = subject === 'Todas as áreas' || lesson.subject === subject;
    const matchesQuery = `${lesson.lesson_number} ${lesson.title} ${lesson.subject}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'));
    return matchesFilter && matchesSubject && matchesQuery;
  }), [lessons, progress, filter, subject, query]);
  const completedCount = lessons.filter((lesson) => progress[lesson.id]?.status === 'completed').length;

  useEffect(() => {
    if (!requestedLesson || loading) return;
    const timer = window.setTimeout(() => document.getElementById(`lesson-${requestedLesson}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }), 50);
    return () => window.clearTimeout(timer);
  }, [requestedLesson, loading]);

  async function saveProgress(lesson: Lesson, status: UserLessonProgress['status'], custom?: LessonDraft) {
    setSaving(lesson.id); setError(''); setMessage('');
    const previous = progress[lesson.id];
    const draft = custom ?? drafts[lesson.id] ?? { resume: '', watchedMinutes: '', notes: '' };
    try {
      const resume = parseResumePositionSeconds(draft.resume, lesson.duration_seconds);
      const watchedSeconds = draft.watchedMinutes.trim() === '' ? previous?.watched_seconds ?? 0 : Math.round(Number(draft.watchedMinutes) * 60);
      if (!Number.isFinite(watchedSeconds) || !Number.isInteger(watchedSeconds) || watchedSeconds < 0) throw new Error('Informe um tempo assistido válido em minutos.');
      if (lesson.duration_seconds !== null && watchedSeconds > lesson.duration_seconds) throw new Error('O tempo informado não pode superar a duração cadastrada da aula.');
      requireOnline();
      const { data, error: updateError } = await getSupabase().from('user_lesson_progress').upsert({ lesson_id: lesson.id, status, watched_seconds: watchedSeconds, resume_position_seconds: resume, notes: draft.notes.trim() || null, started_at: status === 'not_started' ? null : previous?.started_at ?? new Date().toISOString(), completed_at: status === 'completed' ? new Date().toISOString() : null }, { onConflict: 'user_id,lesson_id' }).select('*').single();
      if (updateError) throw updateError;
      const row = data as UserLessonProgress;
      setProgress((current) => ({ ...current, [lesson.id]: row })); setMessage(`Aula ${lesson.lesson_number}: ${statusLabels[status].toLocaleLowerCase('pt-BR')} salva na sua conta.`);
    } catch (e) { setError(formatError(e)); }
    finally { setSaving(''); }
  }

  function openVideo(lesson: Lesson) {
    if (!lesson.video_url || lesson.availability !== 'available') return;
    if (!isOnline) { setError('Sem conexão. Conecte-se antes de abrir o vídeo e sincronizar o progresso.'); return; }
    if (!openApprovedExternalUrl(lesson.video_url)) { setError('Este link de vídeo não passou pela validação de segurança.'); return; }
    void saveProgress(lesson, 'in_progress');
  }

  if (loading) return <LoadingState label="Carregando as aulas da sua biblioteca…" />;
  return <div className="lessons-page"><PageIntro title="Aulas Assaad" description="As 28 aulas do cronograma e as quatro aulas complementares, em um só lugar." action={<StatusTag>{completedCount} de {lessons.length} concluídas</StatusTag>} />
    {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <div className="lesson-toolbar"><label className="search-box"><Search size={17} /><span className="sr-only">Buscar aula</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por aula, título ou área" /></label><label className="filter-select"><span className="sr-only">Filtrar área</span><select value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    <div className="filter-tabs" role="group" aria-label="Filtrar aulas">{([{ id: 'all', label: 'Todas' }, { id: 'planned', label: 'Do cronograma' }, { id: 'extra', label: 'Complementares' }, { id: 'completed', label: 'Concluídas' }] as const).map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} className={filter === item.id ? 'selected' : ''} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
    {visibleLessons.length === 0 ? <EmptyState title="Nenhuma aula encontrada" description="Tente outro termo ou filtro. A biblioteca é carregada do Supabase." /> : <div className="lesson-list">{visibleLessons.map((lesson) => {
      const row = progress[lesson.id]; const status = row?.status ?? 'not_started'; const available = lesson.availability === 'available' && Boolean(lesson.video_url); const draft = drafts[lesson.id] ?? { resume: '', watchedMinutes: '', notes: '' };
      const duration = lesson.duration_label || (lesson.duration_seconds !== null ? `${Math.round(lesson.duration_seconds / 60)} min` : 'Duração pendente');
      const availabilityText = lesson.availability === 'private' ? 'Vídeo privado' : lesson.availability === 'pending' ? 'Disponibilidade pendente' : lesson.availability === 'unavailable' ? 'Vídeo indisponível' : 'Link não informado';
      return <article id={`lesson-${lesson.id}`} className="lesson-item" key={lesson.id}><div className="lesson-number">{String(lesson.lesson_number).padStart(2, '0')}</div><div className="lesson-info"><div className="lesson-title-line"><h3>{lesson.title}</h3>{lesson.is_extra && <StatusTag>Complementar</StatusTag>}</div><div className="lesson-meta"><span>{lesson.subject}</span>{lesson.priority && <span>Prioridade {lesson.priority}</span>}<span><Clock3 size={13} />{duration}</span>{lesson.scheduled_date && <span>Prevista {formatDate(lesson.scheduled_date)}</span>}</div><div className="lesson-status-line"><StatusTag tone={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'neutral'}>{statusLabels[status]}</StatusTag>{lesson.verification_status !== 'confirmed' && <StatusTag tone="pending">Dados pendentes</StatusTag>}</div>
          <details className="lesson-details"><summary>Salvar tempo, ponto e anotação</summary><div className="lesson-detail-form"><label className="field"><span>Tempo assistido informado (minutos)</span><input type="number" min="0" step="any" max={lesson.duration_seconds !== null ? lesson.duration_seconds / 60 : undefined} value={draft.watchedMinutes} onChange={(e) => setDrafts((current) => ({ ...current, [lesson.id]: { ...draft, watchedMinutes: e.target.value } }))} placeholder="Opcional" /></label><label className="field"><span>Ponto de retomada em segundos</span><input type="number" min="0" step="1" max={lesson.duration_seconds ?? undefined} value={draft.resume} onChange={(e) => setDrafts((current) => ({ ...current, [lesson.id]: { ...draft, resume: e.target.value } }))} placeholder="Opcional" /></label><label className="field"><span>Anotação pessoal</span><textarea rows={2} value={draft.notes} onChange={(e) => setDrafts((current) => ({ ...current, [lesson.id]: { ...draft, notes: e.target.value } }))} placeholder="O que quer lembrar ao voltar?" /></label><Button variant="secondary" disabled={saving === lesson.id || !isOnline} onClick={() => void saveProgress(lesson, status, draft)}>{saving === lesson.id ? 'Salvando…' : 'Salvar alterações'}<Check size={15} /></Button></div></details>
        </div><div className="lesson-actions"><label className="lesson-status-select"><span className="sr-only">Status da aula {lesson.lesson_number}</span><select value={status} disabled={saving === lesson.id || !isOnline} onChange={(e) => void saveProgress(lesson, e.target.value as UserLessonProgress['status'])}><option value="not_started">Não iniciada</option><option value="in_progress">Em andamento</option><option value="completed">Concluída</option></select></label>{available ? <Button disabled={!isOnline} onClick={() => openVideo(lesson)}>Assistir aula <ExternalLink size={15} /></Button> : <Button variant="secondary" disabled title={availabilityText}>{availabilityText}</Button>}</div>
      </article>;
    })}</div>}
    <p className="source-footnote"><BookOpen size={14} /> As aulas extras aparecem separadas das 28 previstas. Títulos, durações e disponibilidade pendentes não foram preenchidos por suposição.</p>
  </div>;
}
