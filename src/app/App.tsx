import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, supabaseConfigured } from '../lib/supabase';
import { AuthScreen, UpdatePasswordScreen } from '../features/auth/AuthScreen';
import { AppShell } from '../components/AppShell';

const AuthContext = createContext<{ session: Session | null }>({ session: null });
export const useAuth = () => useContext(AuthContext);

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState('');

  useEffect(() => {
    if (!supabaseConfigured) {
      setInitError('A conexão segura com o Supabase ainda não foi configurada.');
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setInitError('Não foi possível restaurar sua sessão. Tente recarregar a página.');
      setSession(data.session);
      setLoading(false);
    }).catch(() => {
      setInitError('Não foi possível conectar ao Supabase. Verifique sua internet e tente novamente.');
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (initError) return <main className="setup-state"><div className="setup-mark">OE</div><h1>Operação ENEM 2026</h1><p>{initError}</p></main>;
  if (loading) return <main className="setup-state"><span className="loader" /><p>Conectando à sua conta…</p></main>;

  return (
    <AuthContext.Provider value={{ session }}>
      <Routes>
        <Route path="/reset-password" element={session ? <UpdatePasswordScreen /> : <AuthScreen />} />
        <Route path="/*" element={session ? <AppShell /> : <AuthScreen />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
