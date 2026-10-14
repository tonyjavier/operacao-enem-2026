import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleCheck, ExternalLink, Minus, Plus, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, formatError, LoadingState, Notice, StatusTag } from '../../components/UI';
import { addDays, clampStudyDate, daysBetween, FIRST_EXAM, formatDate, SECOND_EXAM, todayInCuiaba, weekdayLong } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import { openApprovedExternalUrl } from '../../lib/external-url';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import type { DayTask, EssayVideo, Lesson, PlanVersion, Resource, ScheduleDay, UserQuestionSession, UserTaskProgress } from '../../lib/database.types';

type LinkedTask = DayTask & { resource?: Resource; lesson?: Lesson; essayVideo?: EssayVideo; done: boolean };

export function TodayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDate = searchParams.get('date') || todayInCuiaba();
  const { date: selectedDate, adjusted } = clampStudyDate(requestedDate);
  const [day, setDay] = useState<ScheduleDay | null>(null);
  const [tasks, setTasks] = useState<LinkedTask[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [correctionDone, setCorrectionDone] = useState(false);
  const [recorded, setRecorded] = useState({ fresh: 0, redo: 0 });
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const isOnline = useOnlineStatus();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const supabase = getSupabase();
      const { data: plan, error: planError } = await supabase.from('plan_versions').select('*').eq('is_active', true).maybeSingle();
      if (planError) throw planError;
      if (!plan) throw new Error('O cronograma ativo ainda não foi publicado no Supabase.');
      const { data: dayData, error: dayError } = await supabase.from('schedule_days').select('*').eq('plan_version_id', (plan as PlanVersion).id).eq('study_date', selectedDate).maybeSingle();
      if (dayError) throw dayError;
      setDay(dayData);
      if (!dayData) { setTasks([]); setRecorded({ fresh: 0, redo: 0 }); return; }
      const { data: taskRows, error: taskError } = await supabase.from('day_tasks').select('*').eq('schedule_day_id', dayData.id).order('position');
      if (taskError) throw taskError;
      const rows = (taskRows ?? []) as DayTask[];
      const resourceIds = rows.flatMap((row) => row.resource_id ? [row.resource_id] : []);
      const lessonIds = rows.flatMap((row) => row.lesson_id ? [row.lesson_id] : []);
      const essayIds = rows.flatMap((row) => row.essay_video_id ? [row.essay_video_id] : []);
      const taskIds = rows.map((row) => row.id);
      const [resources, lessons, essays, progress, sessions] = await Promise.all([
        resourceIds.length ? supabase.from('resources').select('*').eq('plan_version_id', (plan as PlanVersion).id).in('id', resourceIds) : Promise.resolve({ data: [], error: null }),
        lessonIds.length ? supabase.from('lessons').select('*').in('id', lessonIds) : Promise.resolve({ data: [], error: null }),
        essayIds.length ? supabase.from('essay_videos').select('*').in('id', essayIds) : Promise.resolve({ data: [], error: null }),
        taskIds.length ? supabase.from('user_task_progress').select('*').in('day_task_id', taskIds) : Promise.resolve({ data: [], error: null }),
        supabase.from('user_question_sessions').select('new_count,redo_count,correction_done').eq('schedule_day_id', dayData.id),
      ]);
      for (const result of [resources, lessons, essays, progress, sessions]) if (result.error) throw result.error;
      const resourceMap = new Map(((resources.data ?? []) as Resource[]).map((item) => [item.id, item]));
      const lessonMap = new Map(((lessons.data ?? []) as Lesson[]).map((item) => [item.id, item]));
      const essayMap = new Map(((essays.data ?? []) as EssayVideo[]).map((item) => [item.id, item]));
      const progressMap = new Map(((progress.data ?? []) as UserTaskProgress[]).map((item) => [item.day_task_id, item]));
      setTasks(rows.map((row) => ({ ...row, resource: row.resource_id ? resourceMap.get(row.resource_id) : undefined, lesson: row.lesson_id ? lessonMap.get(row.lesson_id) : undefined, essayVideo: row.essay_video_id ? essayMap.get(row.essay_video_id) : undefined, done: progressMap.get(row.id)?.is_completed ?? false })).sort((a, b) => Number(b.kind === 'question') - Number(a.kind === 'question') || a.position - b.position));
      const questionRows = (sessions.data ?? []) as Pick<UserQuestionSession, 'new_count' | 'redo_count' | 'correction_done'>[];
      setRecorded({ fresh: questionRows.reduce((sum, item) => sum + item.new_count, 0), redo: questionRows.reduce((sum, item) => sum + item.redo_count, 0) });
    } catch (e) { setError(formatError(e, 'Não foi possível carregar o dia.')); }
    finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (requestedDate !== selectedDate) { setSearchParams({ date: selectedDate }, { replace: true }); } }, [requestedDate, selectedDate, setSearchParams]);

  const questionTask = useMemo(() => tasks.find((task) => task.kind === 'question'), [tasks]);
  const doneCount = tasks.filter((task) => task.done).length;
  const taskCount = tasks.length;
  const daysFirst = daysBetween(todayInCuiaba(), FIRST_EXAM);
  const daysSecond = daysBetween(todayInCuiaba(), SECOND_EXAM);

  async function markTask(task: LinkedTask, completed: boolean) {
    setError(''); setMessage('');
    try {
      requireOnline();
      const { error: updateError } = await getSupabase().from('user_task_progress').upsert({ day_task_id: task.id, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }, { onConflict: 'user_id,day_task_id' });
      if (updateError) throw updateError;
      setMessage(completed ? 'Tarefa marcada como concluída.' : 'Tarefa reaberta.');
      await load();
    } catch (e) { setError(formatError(e)); }
  }

  function openTask(task: LinkedTask) {
    const url = task.resource?.url ?? task.lesson?.video_url ?? task.essayVideo?.video_url ?? null;
    const canOpen = Boolean(url) && task.verification_status !== 'pending' && (!task.lesson || task.lesson.availability === 'available') && (!task.resource || task.resource.verification_status !== 'pending');
    if (!url || !canOpen) return;
    if (!openApprovedExternalUrl(url)) setError('Este destino externo não passou pela validação de segurança.');
  }

  async function recordQuestions(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      requireOnline();
      if (!day) throw new Error('O dia ainda não está carregado.');
      if (newCount + redoCount < 1) throw new Error('Informe pelo menos uma questão nova ou refeita.');
      const supabase = getSupabase();
      const { data: previousSession, error: lookupError } = await supabase.from('user_question_sessions').select('id').eq('operation_id', operationId).maybeSingle();
      if (lookupError) throw lookupError;
      if (!previousSession) {
        const { error: insertError } = await supabase.from('user_question_sessions').insert({ schedule_day_id: day.id, day_task_id: questionTask?.id ?? null, operation_id: operationId, new_count: newCount, redo_count: redoCount, correction_done: correctionDone });
        if (insertError) throw insertError;
      }
      if (questionTask && correctionDone) {
        const { error: taskError } = await getSupabase().from('user_task_progress').upsert({ day_task_id: questionTask.id, is_completed: true, completed_at: new Date().toISOString() }, { onConflict: 'user_id,day_task_id' });
        if (taskError) throw taskError;
      }
      setNewCount(0); setRedoCount(0); setCorrectionDone(false); setOperationId(crypto.randomUUID()); setMessage(previousSession ? 'Sessão já registrada — os dados não foram duplicados.' : 'Sessão de questões salva na sua conta.');
      await load();
    } catch (e) { setError(formatError(e)); }
    finally { setSaving(false); }
  }

  function adjustCount(which: 'new' | 'redo', amount: number) {
    const setter = which === 'new' ? setNewCount : setRedoCount;
    setter((value) => Math.max(0, value + amount));
  }

  if (loading) return <LoadingState label="Buscando o cronograma do dia…" />;
  return (
    <div className="today-page">
      <section className="today-banner">
        <div className="banner-shape banner-shape-one" /><div className="banner-shape banner-shape-two" /><div className="banner-content">
          <div className="banner-date"><span>{weekdayLong(selectedDate)}</span><span className="banner-separator" />{formatDate(selectedDate)}</div>
          <h2>{day ? day.focus_subject : 'Seu cronograma'}</h2>
          <p>{day?.objective ?? 'O dia mais próximo disponível no seu plano.'}</p>
          <div className="exam-countdowns"><span><b>{daysFirst < 0 ? 0 : daysFirst}</b> {daysFirst === 1 ? 'dia' : 'dias'} para 08/11</span><span className="countdown-rule" /><span><b>{daysSecond < 0 ? 0 : daysSecond}</b> {daysSecond === 1 ? 'dia' : 'dias'} para 15/11</span></div>
        </div>
        <span className="banner-mark" aria-hidden="true"><i /><i /><b /></span>
      </section>

      <div className="today-title-row"><div><h2>O que fazer hoje?</h2><p>Seu plano, em ordem. Abra cada recurso quando estiver pronto.</p></div><div className="date-stepper"><button className="icon-button" aria-label="Dia anterior" onClick={() => setSearchParams({ date: addDays(selectedDate, -1) })}><ChevronLeft size={18} /></button><span>{formatDate(selectedDate, { day: '2-digit', month: 'short' })}</span><button className="icon-button" aria-label="Próximo dia" onClick={() => setSearchParams({ date: addDays(selectedDate, 1) })}><ChevronRight size={18} /></button></div></div>

      {adjusted && <Notice tone="warning">A data atual está fora do período do cronograma. Mostrando a data programada mais próxima: <strong>{formatDate(selectedDate)}.</strong></Notice>}
      {error && <div className="alert alert-error today-alert" role="alert">{error}</div>}{message && <div className="alert alert-success today-alert" role="status">{message}</div>}
      {!day ? <EmptyState title="Não há tarefa cadastrada nesta data" description="Escolha outra data do cronograma para consultar as atividades previstas." /> : <>
        <div className="daily-progress surface"><div><strong>Progresso do dia</strong><span>{doneCount} de {taskCount} tarefas marcadas</span></div><div className="progress-track" role="progressbar" aria-valuenow={taskCount ? Math.round(doneCount / taskCount * 100) : 0} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${taskCount ? doneCount / taskCount * 100 : 0}%` }} /></div></div>
        <section className="section-block task-section"><div className="section-heading"><h3>Plano de estudo</h3><p>{day.weekday} · {day.focus_subject}</p></div>
          <div className="task-list">{tasks.map((task, index) => {
            const pending = task.verification_status === 'pending' || task.lesson?.availability === 'private' || task.lesson?.availability === 'pending' || task.resource?.verification_status === 'pending';
            const external = task.kind === 'question' || task.kind === 'lesson' || task.kind === 'essay_video' || Boolean(task.resource?.url);
            const actionLabel = task.kind === 'question' ? 'Fazer questões' : task.kind === 'lesson' ? 'Assistir aula' : task.kind === 'essay_video' ? 'Assistir vídeo' : task.resource?.url ? 'Abrir material' : '';
            return <article className={`task-row ${task.done ? 'task-done' : ''} ${index === 0 ? 'task-first' : ''}`} key={task.id}>
              <div className="task-rail"><span className={`task-step ${task.done ? 'step-done' : ''}`}>{task.done ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span>{index < tasks.length - 1 && <span className="rail-line" />}</div>
              <div className="task-body"><div className="task-main"><div className="task-copy"><div className="task-heading"><h4>{task.title}</h4>{task.verification_status !== 'confirmed' && <StatusTag tone="pending">{task.verification_status === 'estimated' ? 'Estimado' : 'Pendente'}</StatusTag>}{task.done && <StatusTag tone="success">Concluída</StatusTag>}</div><p>{task.description}</p>{(task.target_min !== null || task.target_max !== null) && <span className="task-target">Meta do plano: {task.target_min ?? task.target_max}{task.target_max !== null && task.target_max !== task.target_min ? `–${task.target_max}` : ''} questões</span>}</div>
                <div className="task-actions">{external && <Button variant={index === 0 && task.kind === 'question' ? 'primary' : 'secondary'} disabled={!isOnline || pending || !((task.resource?.url ?? task.lesson?.video_url ?? task.essayVideo?.video_url))} onClick={() => openTask(task)}>{pending ? 'Link pendente' : actionLabel || 'Abrir material'}<ExternalLink size={15} /></Button>}{!external && <Button variant="secondary" disabled={!isOnline} onClick={() => void markTask(task, !task.done)}>{task.done ? 'Reabrir tarefa' : 'Marcar como feita'}{task.done ? <RotateCcw size={15} /> : <Check size={15} />}</Button>}{external && <button className="complete-task" disabled={!isOnline} onClick={() => void markTask(task, !task.done)}>{task.done ? 'Desfazer conclusão' : 'Marcar como concluída'}<Check size={14} /></button>}</div>
              </div></div>
            </article>;
          })}</div>
        </section>

        {questionTask && <section className="section-block question-log surface"><div className="section-heading"><div><h3>Registrar questões</h3><p>Conte apenas o que você realmente fez.</p></div><StatusTag>{recorded.fresh} novas · {recorded.redo} refeitas</StatusTag></div>
          <form onSubmit={recordQuestions} className="question-form"><div className="question-counter"><label>Questões novas</label><div className="counter-control"><button type="button" aria-label="Diminuir questões novas" onClick={() => adjustCount('new', -1)}><Minus size={15} /></button><output>{newCount}</output><button type="button" aria-label="Adicionar uma questão nova" onClick={() => adjustCount('new', 1)}><Plus size={15} /></button><button className="counter-bulk" type="button" aria-label="Adicionar cinco questões novas" onClick={() => adjustCount('new', 5)}>+5</button><button className="counter-bulk" type="button" aria-label="Adicionar dez questões novas" onClick={() => adjustCount('new', 10)}>+10</button></div></div><div className="question-counter"><label>Questões refeitas</label><div className="counter-control"><button type="button" aria-label="Diminuir questões refeitas" onClick={() => adjustCount('redo', -1)}><Minus size={15} /></button><output>{redoCount}</output><button type="button" aria-label="Adicionar uma questão refeita" onClick={() => adjustCount('redo', 1)}><Plus size={15} /></button><button className="counter-bulk" type="button" aria-label="Adicionar cinco questões refeitas" onClick={() => adjustCount('redo', 5)}>+5</button><button className="counter-bulk" type="button" aria-label="Adicionar dez questões refeitas" onClick={() => adjustCount('redo', 10)}>+10</button></div></div><label className="checkbox-row correction-check"><input type="checkbox" checked={correctionDone} onChange={(e) => setCorrectionDone(e.target.checked)} />Corrigi as questões e registrei o que aprendi</label><Button type="submit" disabled={saving || !isOnline}>{saving ? 'Salvando…' : 'Salvar sessão'}<ArrowUpRight size={16} /></Button></form>
        </section>}
      </>}
      <div className="today-source-note"><CircleCheck size={15} />As tarefas e metas refletem o cronograma enviado. O progresso exibido é o que você registrou.</div>
    </div>
  );
}
