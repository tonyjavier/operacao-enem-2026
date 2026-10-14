import { useEffect, useState } from 'react';
import { Check, Clock3, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, formatError, LoadingState, PageIntro, StatusTag } from '../../components/UI';
import { formatDate, todayInCuiaba } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import { openApprovedExternalUrl } from '../../lib/external-url';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import type { DayTask, EssayVideo, PlanVersion, ScheduleDay, UserEssayVideoProgress } from '../../lib/database.types';
import { EssayTimer } from './EssayTimer';
import './essay.css';

type Microtraining = { date: string; task: DayTask };

export function EssayPage() {
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const requestedVideo = searchParams.get('video');
  const [videos, setVideos] = useState<EssayVideo[]>([]);
  const [videoProgress, setVideoProgress] = useState<Record<string, UserEssayVideoProgress>>({});
  const [microtrainings, setMicrotrainings] = useState<Microtraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const supabase = getSupabase();
        const { data: plan, error: planError } = await supabase.from('plan_versions').select('*').eq('is_active', true).maybeSingle();
        if (planError) throw planError;
        if (!plan) throw new Error('Não há cronograma ativo no Supabase.');
        const planId = (plan as PlanVersion).id;
        const [videoResult, dayResult] = await Promise.all([
          supabase.from('essay_videos').select('*').eq('plan_version_id', planId).order('video_number'),
          supabase.from('schedule_days').select('*').eq('plan_version_id', planId).gte('study_date', todayInCuiaba()).order('study_date'),
        ]);
        for (const result of [videoResult, dayResult]) if (result.error) throw result.error;
        const videoRows = (videoResult.data ?? []) as EssayVideo[];
        const dayRows = (dayResult.data ?? []) as ScheduleDay[];
        const dateByDay = new Map(dayRows.map((day) => [day.id, day.study_date]));
        const dayIds = dayRows.map((day) => day.id);
        const [progressResult, microResult] = await Promise.all([
          videoRows.length ? supabase.from('user_essay_video_progress').select('*').in('essay_video_id', videoRows.map((video) => video.id)) : Promise.resolve({ data: [], error: null }),
          dayIds.length ? supabase.from('day_tasks').select('*').in('schedule_day_id', dayIds).eq('kind', 'microtraining').order('position') : Promise.resolve({ data: [], error: null }),
        ]);
        if (progressResult.error) throw progressResult.error;
        if (microResult.error) throw microResult.error;
        if (!active) return;
        const progressMap = Object.fromEntries(((progressResult.data ?? []) as UserEssayVideoProgress[]).map((item) => [item.essay_video_id, item]));
        const micros = ((microResult.data ?? []) as DayTask[])
          .map((task) => ({ task, date: dateByDay.get(task.schedule_day_id) ?? '' }))
          .filter((item) => item.date)
          .sort((a, b) => a.date.localeCompare(b.date));
        setVideos(videoRows);
        setVideoProgress(progressMap);
        setMicrotrainings(micros);
      } catch (e) {
        if (active) setError(formatError(e, 'Não foi possível carregar a Redação.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!requestedVideo || loading) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`essay-video-${requestedVideo}`)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [requestedVideo, loading]);

  async function setVideoStatus(video: EssayVideo, status: UserEssayVideoProgress['status']) {
    setError('');
    setMessage('');
    try {
      requireOnline();
      const { data, error: updateError } = await getSupabase().from('user_essay_video_progress').upsert(
        { essay_video_id: video.id, status, completed_at: status === 'completed' ? new Date().toISOString() : null },
        { onConflict: 'user_id,essay_video_id' },
      ).select('*').single();
      if (updateError) throw updateError;
      setVideoProgress((current) => ({ ...current, [video.id]: data as UserEssayVideoProgress }));
      setMessage(status === 'completed' ? `Vídeo ${video.video_number} concluído.` : `Progresso do vídeo ${video.video_number} atualizado.`);
    } catch (e) {
      setError(formatError(e));
    }
  }

  function openVideo(video: EssayVideo) {
    if (!isOnline) {
      setError('Sem conexão. Conecte-se para abrir o vídeo e salvar o progresso.');
      return;
    }
    if (!openApprovedExternalUrl(video.video_url)) {
      setError('Este link não passou pela validação de segurança.');
      return;
    }
    void setVideoStatus(video, 'in_progress');
  }

  if (loading) return <LoadingState label="Carregando Redação…" />;

  const completedVideos = videos.filter((video) => videoProgress[video.id]?.status === 'completed').length;

  return (
    <div className="essay-page">
      <PageIntro title="Redação" description="Vídeos e treino com cronômetro." />
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <section className="essay-goal surface">
        <div>
          <h2>5 redações completas até 07/11</h2>
          <p>Ao menos 1 com cronômetro.</p>
        </div>
      </section>
      <EssayTimer />

      <section className="section-block">
        <div className="section-heading">
          <h3>Trilha de vídeos</h3>
          {videos.length > 0 && <StatusTag>{completedVideos} de {videos.length} vistos</StatusTag>}
        </div>
        {videos.length === 0 ? (
          <EmptyState title="Nenhum vídeo disponível" description="Tente novamente mais tarde." />
        ) : (
          <div className="essay-video-list">
            {videos.map((video) => {
              const status = videoProgress[video.id]?.status ?? 'not_started';
              return (
                <article id={`essay-video-${video.id}`} className="essay-video-row" key={video.id}>
                  <span className="essay-video-number">{String(video.video_number).padStart(2, '0')}</span>
                  <div className="essay-video-copy">
                    <h4>{video.title}</h4>
                    <div className="essay-video-meta">
                      <span>{formatDate(video.scheduled_date)}</span>
                      {video.duration_minutes !== null && <span><Clock3 size={13} />{video.duration_minutes} min</span>}
                      <StatusTag tone={status === 'completed' ? 'success' : status === 'in_progress' ? 'warning' : 'neutral'}>
                        {status === 'completed' ? 'Concluído' : status === 'in_progress' ? 'Em andamento' : 'Não iniciado'}
                      </StatusTag>
                    </div>
                    {video.practice_task && <p>{video.practice_task}</p>}
                  </div>
                  <div className="essay-video-actions">
                    <Button variant="secondary" disabled={!isOnline} onClick={() => openVideo(video)}>Assistir vídeo <ExternalLink size={14} /></Button>
                    <button className="complete-task" disabled={!isOnline} onClick={() => void setVideoStatus(video, status === 'completed' ? 'in_progress' : 'completed')}>
                      {status === 'completed' ? 'Desfazer' : 'Marcar como visto'}<Check size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {microtrainings.length > 0 && (
        <details className="microtraining-details">
          <summary>Ver microtreinos do cronograma <span>{microtrainings.length}</span></summary>
          <div className="microtraining-list">
            {microtrainings.map(({ date, task }) => (
              <div className="microtraining-row" key={task.id}>
                <span>{formatDate(date)}</span>
                <div><strong>{task.title}</strong><p>{task.description}</p></div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
