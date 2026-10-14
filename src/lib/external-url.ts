const APPROVED_EXTERNAL_HOSTS = new Set([
  'hospital.questiona.com.br',
  'lucasdorioverde.mt.gov.br',
  'palavraschavenemrenan.link',
  'questoespadroesmatematicaenem.lovable.app',
  'www.gov.br',
  'www.youtube.com',
  'youtu.be',
]);

export function approvedExternalUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !APPROVED_EXTERNAL_HOSTS.has(url.hostname.toLowerCase())) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function openApprovedExternalUrl(input: string | null | undefined): boolean {
  const url = approvedExternalUrl(input);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function trustedSupabaseSignedUrl(input: string | null | undefined): string | null {
  if (!input || !import.meta.env.VITE_SUPABASE_URL) return null;
  try {
    const url = new URL(input);
    const projectOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
    return url.protocol === 'https:' && url.origin === projectOrigin ? url.href : null;
  } catch {
    return null;
  }
}
