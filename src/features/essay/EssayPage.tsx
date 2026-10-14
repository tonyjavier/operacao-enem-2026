import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Clock3, ExternalLink, FileText, Plus, Save } from 'lucide-react';
import { Button, EmptyState, formatError, LoadingState, PageIntro, StatusTag } from '../../components/UI';
import { formatDate, todayInCuiaba } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import { openApprovedExternalUrl } from '../../lib/external-url';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import type { DayTask, EssayVideo, PlanVersion, ScheduleDay, UserEssayEntry, UserEssayVideoProgress } from '../../lib/database.types';
import { EssayTimer } from './EssayTimer';
import './essay.css';

type Microtraining = { date: string; task: DayTask };
const emptyForm = { completed_on: todayInCuiaba(), theme: '', is_timed: false, duration_minutes: '', thesis: '', difficulties: '', argumentation: '', cohesion: '', language: '', intervention: '', rewrite_notes: '', is_complete: false };

export function EssayPage() {
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const requestedVideo = searchParams.get('video');
  const [videos, setVideos] = useState<EssayVideo[]>([]);
  const [videoProgress, setVideoProgress] = useState<Record<string, UserEssayVideoProgress>>({});
  const [entries, setEntries] = useState<UserEssayEntry[]>([]);
  const [microtrainings, setMicrotrainings] = useState<Microtraining[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const planId = (plan as PlanVersion).id;
        const [videoResult, entryResult, dayResult] = await Promise.all([
          supabase.from('essay_videos').select('*').eq('plan_version_id', planId).order('video_number'),
          supabase.from('user_essay_entries').select('*').order('completed_on', { ascending: false }),
          supabase.from('schedule_days').select('*').eq('plan_version_id', planId).gte('study_date', todayInCuiaba()).order('study_date'),
        ]);
        for (const result of [videoResult, entryResult, dayResult]) if (result.error) throw result.error;
        const videoRows = (videoResult.data ?? []) as EssayVideo[];
        const dayRows = (dayResult.data ?? []) as ScheduleDay[];
        const [progressResult, microResult] = await Promise.all([
          videoRows.length ? supabase.from('user_essay_video_progress').select('*').in('essay_video_id', videoRows.map((video) => video.id)) : Promise.resolve({ data: [], error: null }),
          dayRows.length ? supabase.from('day_tasks').select('*').in('schedule_day_id', dayRows.map((day) => day.id)).eq('kind', 'microtraining').order('position') : Promise.resolve({ data: [], error: null }),
        ]);
        if (progressResult.error) throw progressResult.error;
        if (microResult.error) throw microResult.error;
        if (!active) return;
        const progressMap = Object.fromEntries(((progressResult.data ?? []) as UserEssayVideoProgress[]).map((item) => [item.essay_video_id, item]));
        const dateMap = new Map(dayRows.map((day) => [day.id, day.study_date]));
        const micros = ((microResult.data ?? []) as DayTask[]).map((task) => ({ task, date: dateMap.get(task.schedule_day_id) ?? '' })).filter((item) => item.date).sort((a, b) => a.date.localeCompare(b.date));
        setVideos(videoRows); setEntries((entryResult.data ?? []) as UserEssayEntry[]); setVideoProgress(progressMap); setMicrotrainings(micros);
      } catch (e) { if (active) setError(formatError(e, 'Não foi possível carregar a área de Redação.')); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, []);

  const completedEntries = useMemo(() => entries.filter((entry) => entry.is_complete && entry.completed_on <= '2026-11-07'), [entries]);
  const timedEntries = completedEntries.filter((entry) => entry.is_timed);

  useEffect(() => {
    if (!requestedVideo || loading) return;
    const timer = window.setTimeout(() => document.getElementById(`essay-video-${requestedVideo}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }), 50);
    return () => window.clearTimeout(timer);
  }, [requestedVideo, loading]);

  async function setVideoStatus(video: EssayVideo, status: UserEssayVideoProgress['status']) {
    setError(''); setMessage('');
    try {
      requireOnline();
      const { data, error: updateError } = await getSupabase().from('user_essay_video_progress').upsert({ essay_video_id: video.id, status, completed_at: status === 'completed' ? new Date().toISOString() : null }, { onConflict: 'user_id,essay_video_id' }).select('*').single();
      if (updateError) throw updateError;
      setVideoProgress((current) => ({ ...current, [video.id]: data as UserEssayVideoProgress }));
      setMessage(`Vídeo ${video.video_number}: ${status === 'completed' ? 'concluído' : 'progresso atualizado'}.`);
    } catch (e) { setError(formatError(e)); }
  }
  function openVideo(video: EssayVideo) {
    if (!isOnline) { setError('Sem conexão. Conecte-se antes de abrir o vídeo e sincronizar o progresso.'); return; }
    if (!openApprovedExternalUrl(video.video_url)) { setError('Este link de vídeo não passou pela validação de segurança.'); return; }
    void setVideoStatus(video, 'in_progress');
  }

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    const invalidScore = Object.values(scores).some((value) => {
      if (value.trim() === '') return false;
      const score = Number(value);
      return !Number.isInteger(score) || score < 0 || score > 200;
    });
    if (invalidScore) { setError('Informe notas inteiras de 0 a 200 ou deixe o campo em branco.'); return; }
    setSaving(true);
    const competencyScores = Object.fromEntries(Object.entries(scores).filter(([, value]) => value.trim() !== '' && Number.isFinite(Number(value))).map(([key, value]) => [key, Number(value)]));
    const duration = form.duration_minutes.trim() === '' ? null : Number(form.duration_minutes);
    try {
      requireOnline();
      const { data, error: insertError } = await getSupabase().from('user_essay_entries').insert({ completed_on: form.completed_on, theme: form.theme.trim() || null, is_complete: form.is_complete, is_timed: form.is_timed, duration_minutes: duration, thesis: form.thesis.trim() || null, difficulties: form.difficulties.trim() || null, argumentation: form.argumentation.trim() || null, cohesion: form.cohesion.trim() || null, language: form.language.trim() || null, intervention: form.intervention.trim() || null, rewrite_notes: form.rewrite_notes.trim() || null, competency_scores: competencyScores }).select('*').single();
      if (insertError) throw insertError;
      setEntries((current) => [data as UserEssayEntry, ...current].sort((a, b) => b.completed_on.localeCompare(a.completed_on)));
      setForm({ ...emptyForm, completed_on: todayInCuiaba() }); setScores({}); setShowForm(false); setMessage('Produção salva na sua conta.');
    } catch (e) { setError(formatError(e)); }
    finally { setSaving(false); }
  }

  if (loading) return <LoadingState label="Carregando sua trilha de Redação…" />;
  return <div className="essay-page"><PageIntro title="Redação" description="Acompanhe os vídeos e registre suas próprias produções, sem nota automática." action={<Button onClick={() => setShowForm((value) => !value)}><Plus size={16} />Nova produção</Button>} />
    {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <section className="essay-goal surface"><div><h2>5 redações completas até 07/11</h2><p>Inclua pelo menos uma produção cronometrada. A contagem considera apenas o que você marcou como completo.</p></div><div className="essay-goal-count"><strong>{completedEntries.length}<span>/5</span></strong><small>{timedEntries.length > 0 ? 'há produção cronometrada' : 'nenhuma cronometrada registrada'}</small></div></section>

    {showForm && <section className="essay-entry-form surface"><div className="section-heading"><div><h3>Registrar produção</h3><p>Os campos de avaliação são opcionais e só recebem o que você digitar.</p></div><FileText size={20} /></div><form onSubmit={saveEntry} className="essay-form-grid">
      <label className="field"><span>Data</span><input type="date" value={form.completed_on} onChange={(e) => setForm({ ...form, completed_on: e.target.value })} required /></label>
      <label className="field"><span>Tema</span><input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Tema da redação" /></label>
      <label className="field"><span>Tempo (minutos)</span><input type="number" min="0" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} placeholder="Opcional" /></label>
      <label className="checkbox-row essay-checkbox"><input type="checkbox" checked={form.is_timed} onChange={(e) => setForm({ ...form, is_timed: e.target.checked })} />Produção cronometrada</label>
      <div className="essay-wide"><EssayTimer onFinish={(minutes) => setForm((current) => ({ ...current, is_timed: true, duration_minutes: String(minutes) }))} /></div>
      <label className="field essay-wide"><span>Tese</span><textarea rows={2} value={form.thesis} onChange={(e) => setForm({ ...form, thesis: e.target.value })} placeholder="Sua tese, se quiser registrar" /></label>
      <label className="field"><span>Dificuldades</span><textarea rows={2} value={form.difficulties} onChange={(e) => setForm({ ...form, difficulties: e.target.value })} placeholder="Pontos que quer trabalhar" /></label>
      <label className="field"><span>Argumentação</span><textarea rows={2} value={form.argumentation} onChange={(e) => setForm({ ...form, argumentation: e.target.value })} placeholder="Anotações" /></label>
      <label className="field"><span>Coesão</span><textarea rows={2} value={form.cohesion} onChange={(e) => setForm({ ...form, cohesion: e.target.value })} placeholder="Anotações" /></label>
      <label className="field"><span>Linguagem</span><textarea rows={2} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Anotações" /></label>
      <label className="field"><span>Proposta de intervenção</span><textarea rows={2} value={form.intervention} onChange={(e) => setForm({ ...form, intervention: e.target.value })} placeholder="Anotações" /></label>
      <label className="field"><span>Reescrita</span><textarea rows={2} value={form.rewrite_notes} onChange={(e) => setForm({ ...form, rewrite_notes: e.target.value })} placeholder="O que pretende reescrever?" /></label>
      <fieldset className="competency-fields essay-wide"><legend>Notas por competência (opcional; apenas se você já as tiver)</legend>{[1,2,3,4,5].map((number) => <label className="field" key={number}><span>Competência {number}</span><input type="number" min="0" max="200" step="1" value={scores[String(number)] ?? ''} onChange={(e) => setScores((current) => ({ ...current, [String(number)]: e.target.value }))} placeholder="Não informado" /></label>)}</fieldset>
      <label className="checkbox-row essay-complete essay-wide"><input type="checkbox" checked={form.is_complete} onChange={(e) => setForm({ ...form, is_complete: e.target.checked })} />Confirmo que esta produção está completa</label>
      <div className="essay-form-actions essay-wide"><Button type="submit" disabled={saving || !isOnline}>{saving ? 'Salvando…' : 'Salvar produção'}<Save size={16} /></Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button></div>
    </form></section>}

    <section className="section-block"><div className="section-heading"><div><h3>Trilha de vídeos</h3><p>Abra no YouTube e volte para marcar seu progresso.</p></div><StatusTag>{videos.filter((video) => videoProgress[video.id]?.status === 'completed').length} de {videos.length} vistos</StatusTag></div>
      {videos.length === 0 ? <EmptyState title="Vídeos ainda não carregados" description="Os links enviados aparecerão aqui quando estiverem cadastrados no Supabase." /> : <div className="essay-video-list">{videos.map((video) => { const status = videoProgress[video.id]?.status ?? 'not_started'; return <article id={`essay-video-${video.id}`} className="essay-video-row" key={video.id}><span className="essay-video-number">{String(video.video_number).padStart(2, '0')}</span><div className="essay-video-copy"><h4>{video.title}</h4><div className="essay-video-meta"><span>{formatDate(video.scheduled_date)}</span>{video.duration_minutes !== null && <span><Clock3 size={13} />{video.duration_minutes} min</span>}<StatusTag tone={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'neutral'}>{status === 'completed' ? 'Concluído' : status === 'in_progress' ? 'Em andamento' : 'Não iniciado'}</StatusTag></div><p>{video.practice_task}</p></div><div className="essay-video-actions"><Button variant="secondary" disabled={!isOnline} onClick={() => openVideo(video)}>Assistir vídeo <ExternalLink size={14} /></Button><button className="complete-task" disabled={!isOnline} onClick={() => void setVideoStatus(video, status === 'completed' ? 'in_progress' : 'completed')}>{status === 'completed' ? 'Desfazer' : 'Marcar como visto'}<Check size={14} /></button></div></article>; })}</div>}
    </section>

    <section className="section-block microtraining-section"><div className="section-heading"><div><h3>Microtreinos previstos</h3><p>Atividades curtas retiradas do cronograma.</p></div></div>{microtrainings.length ? <div className="microtraining-list">{microtrainings.map(({ date, task }) => <div className="microtraining-row" key={task.id}><span>{formatDate(date)}</span><div><strong>{task.title}</strong><p>{task.description}</p></div></div>)}</div> : <p className="muted-copy">Não há microtreino futuro cadastrado.</p>}</section>

    <section className="section-block"><div className="section-heading"><div><h3>Minhas produções</h3><p>Registros privados da sua conta no Supabase.</p></div></div>{entries.length === 0 ? <EmptyState title="Nenhuma produção registrada ainda" description="Use “Nova produção” para guardar seu tema, tempo e anotações." /> : <div className="essay-entry-list">{entries.map((entry) => <article className="essay-entry-row" key={entry.id}><div><strong>{entry.theme || 'Redação sem tema informado'}</strong><p>{formatDate(entry.completed_on)}{entry.duration_minutes !== null ? ` · ${entry.duration_minutes} min` : ''}{entry.is_timed ? ' · cronometrada' : ''}</p></div><div className="entry-badges">{entry.is_complete ? <StatusTag tone="success">Completa</StatusTag> : <StatusTag>Rascunho</StatusTag>}{entry.competency_scores && Object.keys(entry.competency_scores).length > 0 && <StatusTag>Notas informadas</StatusTag>}</div></article>)}</div>}</section>
  </div>;
}
