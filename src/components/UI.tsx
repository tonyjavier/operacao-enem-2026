import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'text'; children: ReactNode }) {
  return <button className={`button button-${variant} ${className}`.trim()} {...props}>{children}</button>;
}

export function PageIntro({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="page-intro"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action && <div className="page-intro-action">{action}</div>}</div>;
}

export function Notice({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warning' | 'success' }) {
  return <div className={`notice notice-${tone}`} role={tone === 'warning' ? 'status' : undefined}>{children}</div>;
}

export function StatusTag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'pending' | 'success' | 'warning' }) {
  return <span className={`status-tag status-${tone}`}><span className="status-tag-mark" aria-hidden="true" />{children}</span>;
}

export function LoadingState({ label = 'Carregando do Supabase…' }: { label?: string }) {
  return <div className="loading-state" role="status"><span className="loader" />{label}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-mark" aria-hidden="true">—</span><h3>{title}</h3><p>{description}</p></div>;
}

export function formatError(error: unknown, fallback = 'Não foi possível salvar. Verifique sua conexão e tente novamente.') {
  if (error instanceof Error && /fetch|network|offline/i.test(error.message)) return 'Sem conexão com o Supabase. O app não salva dados no aparelho; reconecte-se e tente novamente.';
  return error instanceof Error ? error.message : fallback;
}
