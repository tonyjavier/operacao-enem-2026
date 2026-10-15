import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ExternalLink, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, formatError, LoadingState, Notice, StatusTag } from '../../components/UI';
import { addDays, clampStudyDate, daysBetween, FIRST_EXAM, formatDate, isValidIsoDate, SECOND_EXAM, todayInCuiaba, weekdayLong } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import { openApprovedExternalUrl } from '../../lib/external-url';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import type { DayTask, EssayVideo, Lesson, PlanVersion, Resource, ScheduleDay, UserTaskProgress } from '../../lib/database.types';

type LinkedTask = DayTask & { resource?: Resource; lesson?: Lesson; essayVideo?: EssayVideo; done: boolean };

export function TodayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDate = searchParams.get('date') || todayInCuiaba();
  const { date: selectedDate, adjusted } = clampStudyDate(requestedDate);
  const invalidRequestedDate = !isValidIsoDate(requestedDate);
  const [day, setDay] = useState<ScheduleDay | null>(null);
  const [tasks, setTasks] = useState<LinkedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const isOnline = useOnlineStatus();
  const loadSequence = useRef(0);

  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    const isCurrent = () => sequence === loadSequence.current;
    setLoading(true);
    setError('');
    setDay(null);
    setTasks([]);
    try {
      const supabase = getSupabase();
      const { data: plan, error: planError } = await supabase.from('plan_versions').select('*').eq('is_active', true).maybeSingle();
      if (!isCurrent()) return;
      if (planError) throw planError;
      if (!plan) throw new Error('O cronograma ativo ainda não foi publicado no Supabase.');

      const { data: dayData, error: dayError } = await supabase
        .from('schedule_days')
        .select('*')
        .eq('plan_version_id', (plan as PlanVersion).id)
        .eq('study_date', selectedDate)
        .maybeSingle();
      if (!isCurrent()) return;
      if (dayError) throw dayError;
      if (!dayData) {
        return;
      }

      const { data: taskRows, error: taskError } = await supabase.from('day_tasks').select('*').eq('schedule_day_id', dayData.id).order('position');
      if (!isCurrent()) return;
      if (taskError) throw taskError;
      const rows = (taskRows ?? []) as DayTask[];
      const resourceIds = rows.flatMap((row) => row.resource_id ? [row.resource_id] : []);
      const lessonIds = rows.flatMap((row) => row.lesson_id ? [row.lesson_id] : []);
      const essayIds = rows.flatMap((row) => row.essay_video_id ? [row.essay_video_id] : []);
      const taskIds = rows.map((row) => row.id);
      const [resources, lessons, essays, progress] = await Promise.all([
        resourceIds.length ? supabase.from('resources').select('*').eq('plan_version_id', (plan as PlanVersion).id).in('id', resourceIds) : Promise.resolve({ data: [], error: null }),
        lessonIds.length ? supabase.from('lessons').select('*').eq('plan_version_id', (plan as PlanVersion).id).in('id', lessonIds) : Promise.resolve({ data: [], error: null }),
        essayIds.length ? supabase.from('essay_videos').select('*').eq('plan_version_id', (plan as PlanVersion).id).in('id', essayIds) : Promise.resolve({ data: [], error: null }),
        taskIds.length ? supabase.from('user_task_progress').select('*').in('day_task_id', taskIds) : Promise.resolve({ data: [], error: null }),
      ]);
      if (!isCurrent()) return;
      for (const result of [resources, lessons, essays, progress]) if (result.error) throw result.error;

      const resourceMap = new Map(((resources.data ?? []) as Resource[]).map((item) => [item.id, item]));
      const lessonMap = new Map(((lessons.data ?? []) as Lesson[]).map((item) => [item.id, item]));
      const essayMap = new Map(((essays.data ?? []) as EssayVideo[]).map((item) => [item.id, item]));
      const progressMap = new Map(((progress.data ?? []) as UserTaskProgress[]).map((item) => [item.day_task_id, item]));
      setDay(dayData);
      setTasks(rows
        .map((row) => ({
          ...row,
          resource: row.resource_id ? resourceMap.get(row.resource_id) : undefined,
          lesson: row.lesson_id ? lessonMap.get(row.lesson_id) : undefined,
          essayVideo: row.essay_video_id ? essayMap.get(row.essay_video_id) : undefined,
          done: progressMap.get(row.id)?.is_completed ?? false,
        }))
        .sort((a, b) => Number(b.kind === 'question') - Number(a.kind === 'question') || a.position - b.position));
    } catch (e) {
      if (isCurrent()) setError(formatError(e, 'Não foi possível carregar o dia.'));
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { void load(); }, [load]);

  const doneCount = tasks.filter((task) => task.done).length;
  const taskCount = tasks.length;
  const daysFirst = daysBetween(todayInCuiaba(), FIRST_EXAM);
  const daysSecond = daysBetween(todayInCuiaba(), SECOND_EXAM);

  async function markTask(task: LinkedTask, completed: boolean) {
    setError('');
    setMessage('');
    try {
      requireOnline();
      const { error: updateError } = await getSupabase().from('user_task_progress').upsert(
        { day_task_id: task.id, is_completed: completed, completed_at: completed ? new Date().toISOString() : null },
        { onConflict: 'user_id,day_task_id' },
      );
      if (updateError) throw updateError;
      setMessage(completed ? 'Tarefa concluída.' : 'Tarefa reaberta.');
      await load();
    } catch (e) {
      setError(formatError(e));
    }
  }

  function openTask(task: LinkedTask) {
    const url = task.resource?.url ?? task.lesson?.video_url ?? task.essayVideo?.video_url ?? null;
    const canOpen = Boolean(url)
      && task.verification_status !== 'pending'
      && (!task.lesson || task.lesson.availability === 'available')
      && (!task.resource || task.resource.verification_status !== 'pending');
    if (!url || !canOpen) return;
    if (!openApprovedExternalUrl(url)) setError('Este destino externo não passou pela validação de segurança.');
  }

  if (loading) return <LoadingState label="Buscando o cronograma do dia…" />;

  return (
    <div className="today-page">
      <section className="today-banner">
        <div className="banner-shape banner-shape-one" />
        <div className="banner-shape banner-shape-two" />
        <div className="banner-content">
          <div className="banner-date"><span>{weekdayLong(selectedDate)}</span><span className="banner-separator" />{formatDate(selectedDate)}</div>
          <h2>{day ? day.focus_subject : 'Seu cronograma'}</h2>
          <p>{day?.objective ?? 'O dia mais próximo disponível no seu plano.'}</p>
          <div className="exam-countdowns">
            <span><b>{Math.max(0, daysFirst)}</b> {daysFirst === 1 ? 'dia' : 'dias'} para 08/11</span>
            <span className="countdown-rule" />
            <span><b>{Math.max(0, daysSecond)}</b> {daysSecond === 1 ? 'dia' : 'dias'} para 15/11</span>
          </div>
        </div>
        <span className="banner-mark" aria-hidden="true"><i /><i /><b /></span>
      </section>

      <div className="today-title-row">
        <h2>O que fazer hoje?</h2>
        <div className="date-stepper">
          <button className="icon-button" aria-label="Dia anterior" onClick={() => setSearchParams({ date: addDays(selectedDate, -1) })}><ChevronLeft size={18} /></button>
          <span>{formatDate(selectedDate, { day: '2-digit', month: 'short' })}</span>
          <button className="icon-button" aria-label="Próximo dia" onClick={() => setSearchParams({ date: addDays(selectedDate, 1) })}><ChevronRight size={18} /></button>
        </div>
      </div>

      {adjusted && <Notice tone="warning">{invalidRequestedDate ? 'Data inválida' : 'Data fora do cronograma'}. Mostrando {formatDate(selectedDate)}.</Notice>}
      {error && <div className="alert alert-error today-alert" role="alert">{error}</div>}
      {message && <div className="alert alert-success today-alert" role="status">{message}</div>}
      {!day ? (
        error ? null : <EmptyState title="Sem tarefas nesta data" description="Escolha outra data do cronograma." />
      ) : (
        <>
          <div className="daily-progress surface">
            <div><strong>Progresso do dia</strong><span>{doneCount} de {taskCount} tarefas concluídas</span></div>
            <div className="progress-track" role="progressbar" aria-valuenow={taskCount ? Math.round(doneCount / taskCount * 100) : 0} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${taskCount ? doneCount / taskCount * 100 : 0}%` }} />
            </div>
          </div>
          <section className="section-block task-section">
            <div className="section-heading"><h3>Plano de estudo</h3></div>
            <div className="task-list">
              {tasks.map((task, index) => {
                const pending = task.verification_status === 'pending'
                  || task.lesson?.availability === 'private'
                  || task.lesson?.availability === 'pending'
                  || task.resource?.verification_status === 'pending';
                const external = task.kind === 'question' || task.kind === 'lesson' || task.kind === 'essay_video' || Boolean(task.resource?.url);
                const actionLabel = task.kind === 'question' ? 'Fazer questões'
                  : task.kind === 'lesson' ? 'Assistir aula'
                    : task.kind === 'essay_video' ? 'Assistir vídeo'
                      : task.resource?.url ? 'Abrir material' : '';

                return (
                  <article className={`task-row ${task.done ? 'task-done' : ''} ${index === 0 ? 'task-first' : ''}`} key={task.id}>
                    <div className="task-rail">
                      <span className={`task-step ${task.done ? 'step-done' : ''}`}>{task.done ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span>
                      {index < tasks.length - 1 && <span className="rail-line" />}
                    </div>
                    <div className="task-body">
                      <div className="task-main">
                        <div className="task-copy">
                          <div className="task-heading">
                            <h4>{task.title}</h4>
                            {task.verification_status !== 'confirmed' && <StatusTag tone="pending">{task.verification_status === 'estimated' ? 'Estimado' : 'Pendente'}</StatusTag>}
                            {task.done && <StatusTag tone="success">Concluída</StatusTag>}
                          </div>
                          <p>{task.description}</p>
                          {(task.target_min !== null || task.target_max !== null) && (
                            <span className="task-target">Meta do plano: {task.target_min ?? task.target_max}{task.target_max !== null && task.target_max !== task.target_min ? `–${task.target_max}` : ''} questões</span>
                          )}
                        </div>
                        <div className="task-actions">
                          {external ? (
                            <>
                              <Button variant={index === 0 && task.kind === 'question' ? 'primary' : 'secondary'} disabled={!isOnline || pending || !Boolean(task.resource?.url ?? task.lesson?.video_url ?? task.essayVideo?.video_url)} onClick={() => openTask(task)}>
                                {pending ? 'Link pendente' : actionLabel || 'Abrir material'}<ExternalLink size={15} />
                              </Button>
                              <button className="complete-task" disabled={!isOnline} onClick={() => void markTask(task, !task.done)}>
                                {task.done ? 'Desfazer conclusão' : 'Marcar como concluída'}<Check size={14} />
                              </button>
                            </>
                          ) : (
                            <Button variant="secondary" disabled={!isOnline} onClick={() => void markTask(task, !task.done)}>
                              {task.done ? 'Reabrir tarefa' : 'Marcar como feita'}{task.done ? <RotateCcw size={15} /> : <Check size={15} />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
