import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, formatError, LoadingState, PageIntro, StatusTag } from '../../components/UI';
import { addDays, formatDate, todayInCuiaba } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import type { DayTask, PlanVersion, ScheduleDay, UserTaskProgress } from '../../lib/database.types';

const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const phaseLabel: Record<string, string> = { main_plan: 'Plano principal', final_review: 'Reta final', between_exams: 'Entre provas', exam: 'Dia de prova' };

export function SchedulePage() {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [tasks, setTasks] = useState<DayTask[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState(() => todayInCuiaba() < '2026-10-13' ? '2026-10-13' : todayInCuiaba() > '2026-11-15' ? '2026-11-15' : todayInCuiaba());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const supabase = getSupabase();
        const { data: plan, error: planError } = await supabase.from('plan_versions').select('*').eq('is_active', true).maybeSingle();
        if (planError) throw planError;
        if (!plan) throw new Error('Não há cronograma ativo no Supabase.');
        const { data: dateRows, error: dateError } = await supabase.from('schedule_days').select('*').eq('plan_version_id', (plan as PlanVersion).id).order('study_date');
        if (dateError) throw dateError;
        const dayRows = (dateRows ?? []) as ScheduleDay[];
        const dayIds = dayRows.map((day) => day.id);
        const taskRows = dayIds.length ? await supabase.from('day_tasks').select('*').in('schedule_day_id', dayIds).order('position') : { data: [], error: null };
        if (taskRows.error) throw taskRows.error;
        const rows = (taskRows.data ?? []) as DayTask[];
        const ids = rows.map((task) => task.id);
        const progress = ids.length ? await supabase.from('user_task_progress').select('day_task_id,is_completed').in('day_task_id', ids) : { data: [], error: null };
        if (progress.error) throw progress.error;
        if (!active) return;
        setDays(dayRows); setTasks(rows); setCompletedIds(new Set(((progress.data ?? []) as Pick<UserTaskProgress, 'day_task_id' | 'is_completed'>[]).filter((item) => item.is_completed).map((item) => item.day_task_id)));
        if (!dayRows.some((day) => day.study_date === selectedDate) && dayRows[0]) setSelectedDate(dayRows[0].study_date);
      } catch (e) { if (active) setError(formatError(e, 'Não foi possível carregar o cronograma.')); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, []);

  const dayByDate = useMemo(() => new Map(days.map((day) => [day.study_date, day])), [days]);
  const tasksByDate = useMemo(() => {
    const map = new Map<string, DayTask[]>();
    for (const task of tasks) { const date = days.find((day) => day.id === task.schedule_day_id)?.study_date; if (date) map.set(date, [...(map.get(date) ?? []), task]); }
    return map;
  }, [days, tasks]);
  const startDate = '2026-10-12';
  const calendarDates = useMemo(() => Array.from({ length: 42 }, (_, index) => addDays(startDate, index)), []);
  const selectedDay = dayByDate.get(selectedDate);
  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const completedForDay = selectedTasks.filter((task) => completedIds.has(task.id)).length;

  function taskDestination(task: DayTask) {
    if (task.lesson_id) return { path: `/aulas?lesson=${encodeURIComponent(task.lesson_id)}`, label: 'Ver aula' };
    if (task.essay_video_id) return { path: `/redacao?video=${encodeURIComponent(task.essay_video_id)}`, label: 'Ver vídeo' };
    if (task.resource_id) return { path: `/materiais?resource=${encodeURIComponent(task.resource_id)}`, label: 'Ver material' };
    return null;
  }

  if (loading) return <LoadingState label="Carregando as datas do cronograma…" />;
  return <div className="schedule-page"><PageIntro title="Seu plano, data por data" description="Escolha um dia para ver o foco, as tarefas previstas e o progresso que você registrou." />
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {!days.length && !error ? <EmptyState title="O cronograma ainda não está disponível" description="Assim que os dados forem carregados no Supabase, você verá as datas aqui." /> : <>
      <section className="calendar-surface surface"><div className="calendar-heading"><div><CalendarDays size={18} /><strong>13 de outubro — 15 de novembro</strong></div><StatusTag>{days.length} dias</StatusTag></div><div className="calendar-grid calendar-weekdays">{weekdays.map((name) => <span key={name}>{name}</span>)}</div><div className="calendar-grid">{calendarDates.map((date) => {
        const day = dayByDate.get(date); const dateNumber = Number(date.slice(-2)); const selected = date === selectedDate; const dateTasks = tasksByDate.get(date) ?? []; const done = dateTasks.filter((task) => completedIds.has(task.id)).length;
        return <button key={date} className={`calendar-cell ${day ? 'calendar-active' : 'calendar-outside'} ${selected ? 'calendar-selected' : ''} ${day?.day_type.startsWith('exam') ? 'calendar-exam' : ''} ${day?.phase === 'final_review' ? 'calendar-review' : ''} ${day?.phase === 'between_exams' ? 'calendar-between' : ''}`} onClick={() => day && setSelectedDate(date)} disabled={!day} aria-label={day ? `${formatDate(date)}, ${day.focus_subject}, ${done} de ${dateTasks.length} tarefas marcadas` : formatDate(date)} aria-pressed={selected}>
          <span className="calendar-number">{dateNumber}</span>{day && <><span className="calendar-day-subject">{day.day_type.startsWith('exam') ? 'Prova' : day.focus_subject}</span><span className="calendar-done-count">{done}/{dateTasks.length} feitas</span></>}
        </button>;
      })}</div><div className="calendar-legend"><span><i className="legend-main" />Plano</span><span><i className="legend-review" />Revisão</span><span><i className="legend-exam" />Prova</span></div></section>

      {selectedDay && <section className="selected-day-detail surface"><div className="selected-day-head"><div><h2>{formatDate(selectedDay.study_date, { weekday: 'long', day: 'numeric', month: 'long' })}</h2><StatusTag>{phaseLabel[selectedDay.phase] ?? selectedDay.phase}</StatusTag><p>{selectedDay.focus_subject} · {selectedDay.objective}</p></div><div className="selected-day-progress"><strong>{completedForDay}/{selectedTasks.length}</strong><span>tarefas registradas</span></div></div>
        {selectedDay.question_range && <div className="question-range-note">Questões previstas: <strong>{selectedDay.question_range}</strong></div>}
        <div className="schedule-task-list">{selectedTasks.map((task) => { const destination = taskDestination(task); return <div className="schedule-task" key={task.id}><span className={`schedule-check ${completedIds.has(task.id) ? 'checked' : ''}`}>{completedIds.has(task.id) && <Check size={13} />}</span><div><strong>{task.title}</strong><p>{task.description}</p></div><div className="schedule-task-actions">{task.verification_status !== 'confirmed' && <StatusTag tone="pending">Pendente</StatusTag>}{destination && <button className="text-link" onClick={() => navigate(destination.path)}>{destination.label} <ArrowRight size={14} /></button>}</div></div>; })}{!selectedTasks.length && <p className="muted-copy">Nenhuma tarefa cadastrada para este dia.</p>}</div>
        <button className="button button-primary" onClick={() => navigate(`/?date=${selectedDate}`)}>Ver este dia <ArrowRight size={16} /></button>
      </section>}
      <p className="source-footnote">Metas do documento são apresentadas como metas — não como resultados. As marcações são privadas da sua conta.</p>
    </>}
  </div>;
}
