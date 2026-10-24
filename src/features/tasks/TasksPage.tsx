import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BookOpen, Check, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState, formatError, LoadingState, PageIntro, StatusTag } from '../../components/UI';
import { formatDate } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import type { UserPersonalTask } from '../../lib/database.types';
import './tasks.css';

export function TasksPage() {
  const online = useOnlineStatus();
  const [tasks, setTasks] = useState<UserPersonalTask[]>([]);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [dueOn, setDueOn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function loadTasks() {
      try {
        const { data, error: queryError } = await getSupabase()
          .from('user_personal_tasks')
          .select('*')
          .order('is_completed')
          .order('due_on', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });
        if (queryError) throw queryError;
        if (active) setTasks((data ?? []) as UserPersonalTask[]);
      } catch (e) {
        if (active) setError(formatError(e, 'Não foi possível carregar suas tarefas.'));
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadTasks();
    return () => { active = false; };
  }, []);

  const pendingTasks = useMemo(() => tasks.filter((task) => !task.is_completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.is_completed), [tasks]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      requireOnline();
      const { data, error: insertError } = await getSupabase()
        .from('user_personal_tasks')
        .insert({ title: title.trim(), details: details.trim(), due_on: dueOn || null })
        .select('*')
        .single();
      if (insertError) throw insertError;
      setTasks((current) => [data as UserPersonalTask, ...current]);
      setTitle('');
      setDetails('');
      setDueOn('');
      setMessage('Tarefa salva na sua conta.');
    } catch (e) {
      setError(formatError(e, 'Não foi possível salvar a tarefa.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: UserPersonalTask) {
    setError('');
    setMessage('');
    try {
      requireOnline();
      const { data, error: updateError } = await getSupabase()
        .from('user_personal_tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id)
        .select('*')
        .single();
      if (updateError) throw updateError;
      setTasks((current) => current.map((item) => item.id === task.id ? data as UserPersonalTask : item));
    } catch (e) {
      setError(formatError(e, 'Não foi possível atualizar a tarefa.'));
    }
  }

  async function deleteTask(task: UserPersonalTask) {
    if (!window.confirm(`Apagar a tarefa “${task.title}”?`)) return;
    setError('');
    setMessage('');
    try {
      requireOnline();
      const { error: deleteError } = await getSupabase().from('user_personal_tasks').delete().eq('id', task.id);
      if (deleteError) throw deleteError;
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (e) {
      setError(formatError(e, 'Não foi possível apagar a tarefa.'));
    }
  }

  if (loading) return <LoadingState label="Carregando suas tarefas…" />;

  return (
    <div className="tasks-page">
      <PageIntro title="Minhas tarefas" description="Anote o que você precisa fazer. Sua lista fica privada na sua conta." />
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      <section className="section-block personal-task-section">
        <div className="section-heading"><div><h3>Nova tarefa</h3><p>Use para seus lembretes e próximos passos de estudo.</p></div><StatusTag>{pendingTasks.length} pendentes</StatusTag></div>
        <form className="personal-task-form surface" onSubmit={addTask}>
          <label className="field"><span>O que você precisa fazer?</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Ex.: montar a estrutura da redação" required /></label>
          <label className="field"><span>Detalhes (opcional)</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} rows={3} placeholder="Anote ideias, materiais ou próximos passos" /></label>
          <div className="personal-task-form-footer"><label className="field"><span>Prazo (opcional)</span><input type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} /></label><Button type="submit" disabled={saving || !online}>{saving ? 'Salvando…' : 'Adicionar tarefa'}<Plus size={16} /></Button></div>
        </form>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Para fazer</h3><StatusTag>{pendingTasks.length}</StatusTag></div>
        {pendingTasks.length === 0 ? <EmptyState title="Tudo em dia" description="Quando lembrar de algo, anote acima e ele aparecerá aqui." /> : <div className="personal-task-list">{pendingTasks.map((task) => <TaskRow key={task.id} task={task} online={online} onToggle={() => void toggleTask(task)} onDelete={() => void deleteTask(task)} />)}</div>}
      </section>

      {completedTasks.length > 0 && <details className="completed-tasks"><summary>Concluídas ({completedTasks.length})</summary><div className="personal-task-list">{completedTasks.map((task) => <TaskRow key={task.id} task={task} online={online} onToggle={() => void toggleTask(task)} onDelete={() => void deleteTask(task)} />)}</div></details>}

      <section className="section-block essay-outline-section">
        <div className="section-heading"><div><h3>Estrutura de redação</h3><p>Um roteiro para organizar suas ideias antes de escrever.</p></div><BookOpen size={19} /></div>
        <div className="outline-guide surface">
          <article><span>01</span><div><h4>Introdução</h4><p>Apresente o tema e deixe clara sua tese: o ponto de vista que você vai defender.</p></div></article>
          <article><span>02</span><div><h4>Desenvolvimento 1</h4><p>Defenda o primeiro argumento com explicação e um exemplo ou repertório pertinente.</p></div></article>
          <article><span>03</span><div><h4>Desenvolvimento 2</h4><p>Desenvolva outro argumento ligado à tese, com explicação e relação com o tema.</p></div></article>
          <article><span>04</span><div><h4>Conclusão e intervenção</h4><p>Proponha uma ação para o problema. Deixe claros o agente, a ação, o meio e a finalidade; respeite os direitos humanos.</p></div></article>
          <a href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante" target="_blank" rel="noopener noreferrer">Consultar a cartilha oficial do Inep <BookOpen size={15} /></a>
          <p className="outline-note">É um guia de organização, não uma fórmula de nota. Confira as competências e os exemplos na cartilha.</p>
        </div>
      </section>
    </div>
  );
}

function TaskRow({ task, online, onToggle, onDelete }: { task: UserPersonalTask; online: boolean; onToggle: () => void; onDelete: () => void }) {
  return (
    <article className={`personal-task-row${task.is_completed ? ' is-completed' : ''}`}>
      <button type="button" className="task-check" onClick={onToggle} disabled={!online} aria-label={task.is_completed ? `Reabrir tarefa ${task.title}` : `Concluir tarefa ${task.title}`}>
        {task.is_completed && <Check size={16} />}
      </button>
      <div className="personal-task-copy"><h4>{task.title}</h4>{task.details && <p>{task.details}</p>}{task.due_on && <span>Prazo: {formatDate(task.due_on)}</span>}</div>
      <button type="button" className="task-delete" onClick={onDelete} disabled={!online} aria-label={`Apagar tarefa ${task.title}`}><Trash2 size={16} /></button>
    </article>
  );
}
