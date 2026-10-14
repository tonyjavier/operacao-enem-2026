import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, ExternalLink, FilePlus2, ImagePlus, RotateCcw } from 'lucide-react';
import { Button, EmptyState, formatError, LoadingState, PageIntro, StatusTag } from '../../components/UI';
import { addDays, formatDate, todayInCuiaba } from '../../lib/dates';
import { getSupabase } from '../../lib/supabase';
import { openApprovedExternalUrl, trustedSupabaseSignedUrl } from '../../lib/external-url';
import { requireOnline, useOnlineStatus } from '../../lib/useOnlineStatus';
import { useAuth } from '../../app/App';
import type { PlanVersion, Resource, UserErrorNote } from '../../lib/database.types';
import './materials.css';

const errorTypes = [
  ['knowledge', 'Falta de conhecimento'], ['interpretation', 'Interpretação'], ['calculation', 'Cálculo'], ['concept', 'Conceito'], ['inattention', 'Desatenção'], ['time', 'Gestão do tempo'], ['other', 'Outro'],
] as const;
const emptyNote = { subject: '', topic: '', prompt: '', error_type: 'knowledge', correction_note: '', review_due_on: addDays(todayInCuiaba(), 1) };

export function MaterialsPage() {
  const { session } = useAuth();
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const requestedResource = searchParams.get('resource');
  const [resources, setResources] = useState<Resource[]>([]);
  const [notes, setNotes] = useState<UserErrorNote[]>([]);
  const [form, setForm] = useState(emptyNote);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoLinks, setPhotoLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const supabase = getSupabase();
        const { data: plan, error: planError } = await supabase.from('plan_versions').select('*').eq('is_active', true).maybeSingle();
        if (planError) throw planError;
        if (!plan) throw new Error('Não há cronograma ativo no Supabase.');
        const [resourceResult, noteResult] = await Promise.all([
          supabase.from('resources').select('*').eq('plan_version_id', (plan as PlanVersion).id).order('sort_order'),
          supabase.from('user_error_notes').select('*').order('review_due_on', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }),
        ]);
        if (resourceResult.error) throw resourceResult.error;
        if (noteResult.error) throw noteResult.error;
        if (active) { setResources((resourceResult.data ?? []) as Resource[]); setNotes((noteResult.data ?? []) as UserErrorNote[]); }
      } catch (e) { if (active) setError(formatError(e, 'Não foi possível carregar os materiais.')); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, []);

  const pendingNotes = useMemo(() => notes.filter((note) => !note.reviewed_at), [notes]);
  const reviewedNotes = useMemo(() => notes.filter((note) => note.reviewed_at), [notes]);
  const labelForType = (value: string) => errorTypes.find(([key]) => key === value)?.[1] ?? 'Outro';

  useEffect(() => {
    if (!requestedResource || loading) return;
    const timer = window.setTimeout(() => document.getElementById(`resource-${requestedResource}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }), 50);
    return () => window.clearTimeout(timer);
  }, [requestedResource, loading]);

  function openResource(resource: Resource) {
    if (!resource.url || resource.verification_status === 'pending') return;
    if (!openApprovedExternalUrl(resource.url)) setError('Este destino externo não passou pela validação de segurança.');
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    if (!session?.user.id) { setError('Entre na sua conta para salvar um erro.'); setSaving(false); return; }
    let photoPath: string | null = null;
    try {
      requireOnline();
      const supabase = getSupabase();
      if (photo) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) throw new Error('A foto precisa estar em JPG, PNG ou WebP.');
        if (photo.size > 10 * 1024 * 1024) throw new Error('A foto pode ter no máximo 10 MB.');
        const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
        photoPath = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('error-attachments').upload(photoPath, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { data, error: insertError } = await supabase.from('user_error_notes').insert({ subject: form.subject.trim(), topic: form.topic.trim(), prompt: form.prompt.trim() || null, error_type: form.error_type, correction_note: form.correction_note.trim(), review_due_on: form.review_due_on || null, photo_path: photoPath }).select('*').single();
      if (insertError) {
        if (photoPath) await supabase.storage.from('error-attachments').remove([photoPath]);
        throw insertError;
      }
      setNotes((current) => [data as UserErrorNote, ...current]); setForm({ ...emptyNote, review_due_on: addDays(todayInCuiaba(), 1) }); setPhoto(null); if (fileInput.current) fileInput.current.value = ''; setMessage('Erro salvo em sua conta; a revisão ficou na fila.');
    } catch (e) { setError(formatError(e, 'Não foi possível salvar o erro.')); }
    finally { setSaving(false); }
  }

  async function markReviewed(note: UserErrorNote, reviewed: boolean) {
    setError(''); setMessage('');
    try {
      requireOnline();
      const { data, error: updateError } = await getSupabase().from('user_error_notes').update({ reviewed_at: reviewed ? new Date().toISOString() : null }).eq('id', note.id).select('*').single();
      if (updateError) throw updateError;
      setNotes((current) => current.map((item) => item.id === note.id ? data as UserErrorNote : item)); setMessage(reviewed ? 'Revisão registrada.' : 'Erro devolvido à fila de revisão.');
    } catch (e) { setError(formatError(e)); }
  }

  async function preparePhoto(note: UserErrorNote) {
    if (!note.photo_path) return;
    try {
      requireOnline();
      const { data, error: urlError } = await getSupabase().storage.from('error-attachments').createSignedUrl(note.photo_path, 300);
      if (urlError) throw urlError;
      const signedUrl = trustedSupabaseSignedUrl(data.signedUrl);
      if (!signedUrl) throw new Error('O link temporário da foto não corresponde ao projeto Supabase.');
      setPhotoLinks((current) => ({ ...current, [note.id]: signedUrl }));
      setMessage('Link temporário da foto pronto; abra antes de expirar.');
    } catch (e) { setError(formatError(e, 'Não foi possível abrir esta foto.')); }
  }

  if (loading) return <LoadingState label="Carregando materiais e seu caderno…" />;
  return <div className="materials-page"><PageIntro title="Materiais e erros" description="Atalhos para os recursos do plano e uma fila de revisão privada da sua conta." />
    {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <section className="section-block materials-section"><div className="section-heading"><div><h3>Materiais e referências</h3><p>Os botões abrem o destino em outra aba; o endereço não aparece na tela.</p></div><StatusTag>{resources.length} recursos</StatusTag></div>
      {resources.length === 0 ? <EmptyState title="Materiais ainda não carregados" description="Os recursos do cronograma aparecerão aqui quando publicados no Supabase." /> : <div className="resource-list">{resources.map((resource) => <article id={`resource-${resource.id}`} className="resource-row" key={resource.id}><div className="resource-main"><div className="resource-title-line"><h4>{resource.name}</h4><StatusTag tone={resource.verification_status === 'confirmed' ? 'neutral' : 'pending'}>{resource.verification_status === 'confirmed' ? 'Confirmado' : resource.verification_status === 'estimated' ? 'Estimado' : 'Pendente'}</StatusTag></div><p>{resource.purpose}</p></div><div className="resource-actions">{resource.url && resource.verification_status !== 'pending' ? <Button variant="secondary" disabled={!isOnline} onClick={() => openResource(resource)}>Abrir <ExternalLink size={15} /></Button> : <Button variant="secondary" disabled>{resource.verification_status === 'pending' ? 'Aguardando confirmação' : 'Usado na escola'}</Button>}</div></article>)}</div>}
    </section>

    <section className="section-block error-book-section"><div className="section-heading"><div><h3>Caderno de erros</h3><p>Registre o que errou e a correção em uma frase. Revise em 24–48 horas.</p></div><StatusTag>{pendingNotes.length} na fila</StatusTag></div>
      <form className="error-note-form surface" onSubmit={saveNote}><div className="error-form-heading"><FilePlus2 size={18} /><strong>Novo erro</strong></div><div className="error-form-grid">
        <label className="field"><span>Disciplina</span><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex.: Matemática" required /></label>
        <label className="field"><span>Assunto</span><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Ex.: Função afim" required /></label>
        <label className="field"><span>Tipo de erro</span><select value={form.error_type} onChange={(e) => setForm({ ...form, error_type: e.target.value })}>{errorTypes.map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
        <label className="field"><span>Revisar em</span><input type="date" value={form.review_due_on} onChange={(e) => setForm({ ...form, review_due_on: e.target.value })} /></label>
        <label className="field error-wide"><span>Questão ou contexto (opcional)</span><textarea rows={2} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} placeholder="Escreva um trecho ou identifique a questão" /></label>
        <label className="field error-wide"><span>Correção em uma frase</span><textarea rows={2} value={form.correction_note} onChange={(e) => setForm({ ...form, correction_note: e.target.value })} placeholder="O que você precisa lembrar na próxima vez?" required /></label>
        <div className="file-picker error-wide"><input ref={fileInput} id="error-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} /><label htmlFor="error-photo"><ImagePlus size={17} />{photo ? photo.name : 'Adicionar foto (opcional, até 5 MB)'}</label><span>A imagem fica privada no Supabase.</span></div>
        <div className="error-submit error-wide"><span>Revisão sugerida para {form.review_due_on ? formatDate(form.review_due_on) : 'data não definida'}; você pode ajustar.</span><Button type="submit" disabled={saving || !isOnline}>{saving ? 'Salvando…' : 'Salvar erro'}<ArrowUpRight size={15} /></Button></div>
      </div></form>

      <div className="error-queue-heading"><h4>Fila de revisão</h4><span>{pendingNotes.length} para revisar</span></div>
      {pendingNotes.length === 0 ? <EmptyState title="Sua fila está vazia" description="Quando registrar uma questão difícil, ela aparecerá aqui para revisão." /> : <div className="error-note-list">{pendingNotes.map((note) => {
        const overdue = note.review_due_on ? note.review_due_on <= todayInCuiaba() : false;
        return <article className="error-note-row" key={note.id}><div className="error-note-info"><div className="error-note-head"><strong>{note.subject} <span>·</span> {note.topic}</strong><StatusTag tone={overdue ? 'warning' : 'neutral'}>{overdue ? 'Revisar agora' : note.review_due_on ? `Revisar ${formatDate(note.review_due_on)}` : 'Sem data'}</StatusTag></div><p><b>{labelForType(note.error_type)}.</b> {note.correction_note}</p>{note.prompt && <details className="error-prompt"><summary>Ver questão/contexto</summary><p>{note.prompt}</p></details>}<div className="error-note-actions">{note.photo_path && (photoLinks[note.id] ? <a className="text-link" href={photoLinks[note.id]} target="_blank" rel="noopener noreferrer">Abrir foto</a> : <button className="text-link" disabled={!isOnline} onClick={() => void preparePhoto(note)}>Preparar link da foto</button>)}<button className="text-link" disabled={!isOnline} onClick={() => void markReviewed(note, true)}>Marcar revisão feita <Check size={13} /></button></div></div></article>;
      })}</div>}
      {reviewedNotes.length > 0 && <details className="reviewed-section"><summary>Revisados ({reviewedNotes.length})</summary><div className="error-note-list">{reviewedNotes.map((note) => <article className="error-note-row reviewed-note" key={note.id}><div className="error-note-info"><div className="error-note-head"><strong>{note.subject} · {note.topic}</strong><StatusTag tone="success">Revisado</StatusTag></div><p>{note.correction_note}</p><button className="text-link" disabled={!isOnline} onClick={() => void markReviewed(note, false)}><RotateCcw size={13} /> Devolver à fila</button></div></article>)}</div></details>}
    </section>
    <p className="source-footnote">Seu caderno e suas fotos são privados. Não há exportação local ou armazenamento do progresso no aparelho.</p>
  </div>;
}
