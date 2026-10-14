import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const supabase = getSupabase();
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
      } else if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: name.trim() } } });
        if (authError) throw authError;
        setMessage(data.session ? 'Conta criada. Seu cronograma já está disponível.' : 'Enviamos um email de confirmação. Confirme seu endereço para entrar.');
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (authError) throw authError;
        setMessage('Se este email estiver cadastrado, você receberá um link para redefinir sua senha.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir. Verifique os dados e tente novamente.');
    } finally { setBusy(false); }
  }

  const heading = mode === 'login' ? 'Entre no seu plano.' : mode === 'signup' ? 'Seu cronograma começa aqui.' : 'Recupere seu acesso.';
  return (
    <main className="auth-layout">
      <section className="auth-art" aria-label="Operação ENEM 2026">
        <div className="auth-art-top"><span className="brand-symbol brand-symbol-light" aria-hidden="true"><i /><i /><b /></span><span>OPERAÇÃO ENEM <b>2026</b></span></div>
        <div className="auth-art-copy"><h1>O próximo passo<br />já está no seu<br /><em>cronograma.</em></h1><p>Encontre a tarefa do dia, abra o material e acompanhe o que você concluiu.</p></div>
        <div className="auth-exams"><span><b>08 NOV</b> · 1º dia de prova</span><span><b>15 NOV</b> · 2º dia de prova</span></div>
      </section>
      <section className="auth-panel"><div className="auth-card"><div className="auth-mobile-brand">OPERAÇÃO ENEM <b>2026</b></div><h2>{heading}</h2><p className="auth-description">Seu progresso fica na sua conta e só você pode acessá-lo.</p>
        <form onSubmit={submit} className="form-stack">
          {mode === 'signup' && <label className="field"><span>Como podemos chamar você?</span><div className="input-wrap"><UserRound aria-hidden="true" size={18} /><input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required /></div></label>}
          <label className="field"><span>Email</span><div className="input-wrap"><Mail aria-hidden="true" size={18} /><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required /></div></label>
          {mode !== 'reset' && <label className="field"><span>Senha</span><div className="input-wrap"><LockKeyhole aria-hidden="true" size={18} /><input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" required /></div></label>}
          {mode === 'login' && <button type="button" className="text-link forgot-link" onClick={() => { setMode('reset'); setMessage(''); setError(''); }}>Esqueci minha senha</button>}
          {error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar minha conta' : 'Enviar link de recuperação'}<ArrowRight aria-hidden="true" size={17} /></button>
        </form>
        <div className="auth-switch">{mode === 'login' ? <>Ainda não tem conta? <button className="text-link" onClick={() => { setMode('signup'); setMessage(''); setError(''); }}>Criar conta</button></> : <>Já tem conta? <button className="text-link" onClick={() => { setMode('login'); setMessage(''); setError(''); }}>Entrar</button></>}</div>
        {mode === 'reset' && <button className="text-link reset-back" onClick={() => { setMode('login'); setMessage(''); setError(''); }}>Voltar para entrar</button>}
        <p className="privacy-note">Ao continuar, sua conta será usada apenas para salvar seu próprio progresso no cronograma.</p>
      </div></section>
    </main>
  );
}

export function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(''); setError('');
    try {
      const { error: updateError } = await getSupabase().auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Senha atualizada.');
      window.setTimeout(() => navigate('/'), 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível atualizar a senha. Solicite outro link e tente novamente.');
    } finally { setBusy(false); }
  }
  return <main className="setup-state"><form className="auth-card reset-card" onSubmit={submit}><h1>Escolha uma nova senha</h1><label className="field"><span>Nova senha</span><div className="input-wrap"><LockKeyhole aria-hidden="true" size={18} /><input autoComplete="new-password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div></label>{error && <div className="alert alert-error" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}<button className="button button-primary" disabled={busy}>{busy ? 'Salvando…' : 'Atualizar senha'}</button><Link className="text-link" to="/">Voltar</Link></form></main>;
}
