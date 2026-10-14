import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, ClipboardList, FileText, LogOut, Menu, X } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../app/App';
import { LoadingState } from './UI';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { InstallAppButton } from './PwaInstallButton';

const TodayPage = lazy(() => import('../features/today/TodayPage').then((module) => ({ default: module.TodayPage })));
const SchedulePage = lazy(() => import('../features/schedule/SchedulePage').then((module) => ({ default: module.SchedulePage })));
const LessonsPage = lazy(() => import('../features/lessons/LessonsPage').then((module) => ({ default: module.LessonsPage })));
const EssayPage = lazy(() => import('../features/essay/EssayPage').then((module) => ({ default: module.EssayPage })));
const MaterialsPage = lazy(() => import('../features/resources/MaterialsPage').then((module) => ({ default: module.MaterialsPage })));

const links = [
  { to: '/', label: 'Hoje', icon: ClipboardList, end: true },
  { to: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { to: '/aulas', label: 'Aulas', icon: BookOpen },
  { to: '/redacao', label: 'Redação', icon: FileText },
  { to: '/materiais', label: 'Materiais e erros', icon: BookOpen },
];
const titles: Record<string, string> = { '/': 'Hoje', '/cronograma': 'Cronograma', '/aulas': 'Aulas', '/redacao': 'Redação', '/materiais': 'Materiais e erros' };

export function AppShell() {
  const { session } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const online = useOnlineStatus();
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    function keepFocusInside(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keepFocusInside);
    return () => { document.removeEventListener('keydown', keepFocusInside); if (returnFocus?.isConnected) returnFocus.focus(); };
  }, [menuOpen]);

  async function signOut() {
    setSigningOut(true); setError('');
    const { error: authError } = await getSupabase().auth.signOut({ scope: 'local' });
    if (authError) setError('Não foi possível encerrar a sessão. Tente novamente.');
    setSigningOut(false);
  }
  const email = session?.user.email ?? 'Conta';
  const activeTitle = titles[location.pathname] ?? 'Operação ENEM';

  return (
    <div className="app-shell">
      <aside id="primary-navigation" ref={sidebarRef} className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} role={menuOpen ? 'dialog' : 'complementary'} aria-modal={menuOpen || undefined} aria-label="Navegação principal">
        <div className="brand-lockup"><span className="brand-symbol" aria-hidden="true"><i /><i /><b /></span><div><strong>OPERAÇÃO ENEM</strong><small>2026 · seu plano de estudos</small></div><button ref={closeButtonRef} className="icon-button sidebar-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={19} /></button></div>
        <nav className="side-nav">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav>
        <div className="sidebar-foot">
          <div className="account-row"><span className="account-avatar">{email[0]?.toUpperCase() ?? 'A'}</span><div className="account-copy"><strong>Sua conta</strong><span title={email}>{email}</span></div></div>
          <InstallAppButton />
          <button className="signout-button" onClick={() => void signOut()} disabled={signingOut}><LogOut size={16} />{signingOut ? 'Saindo…' : 'Sair da conta'}</button>
        </div>
      </aside>
      {menuOpen && <button className="nav-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <main className="main-area" inert={menuOpen}>
        <header className="mobile-header"><button className="icon-button mobile-menu-button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><span className="mobile-brand">OPERAÇÃO <b>ENEM</b></span><button className="account-mini" aria-label={signingOut ? 'Saindo da conta' : 'Sair da conta'} title="Sair da conta" onClick={() => void signOut()} disabled={signingOut}><LogOut size={18} /></button></header>
        <div className="desktop-page-header"><p className="page-label">OPERAÇÃO ENEM 2026</p><div className="page-header-line"><h1>{activeTitle}</h1><span className="online-state">{online ? <><i className="status-dot" /> Sincronizado com sua conta</> : <><i className="status-dot offline-dot" /> Sem conexão</>}</span></div></div>
        {!online && <div className="offline-banner" role="status">Sem internet. O cronograma e seu progresso não ficam armazenados no aparelho; conecte-se para carregar e salvar.</div>}
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="page-content"><Suspense fallback={<LoadingState label="Abrindo esta área…" />}><Routes><Route path="/" element={<TodayPage />} /><Route path="/cronograma" element={<SchedulePage />} /><Route path="/aulas" element={<LessonsPage />} /><Route path="/redacao" element={<EssayPage />} /><Route path="/materiais" element={<MaterialsPage />} /><Route path="*" element={<TodayPage />} /></Routes></Suspense></div>
        <footer className="app-footer">Seu cronograma. Seu ritmo. <span>O progresso é privado e sincronizado na sua conta.</span></footer>
      </main>
      <nav className="bottom-nav" inert={menuOpen} aria-label="Navegação inferior">{links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `bottom-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.8} /><span>{label === 'Materiais e erros' ? 'Materiais' : label}</span></NavLink>)}</nav>
    </div>
  );
}
