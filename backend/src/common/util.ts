/** Data de hoje (YYYY-MM-DD) no fuso de Canindé/CE. */
export function hoje(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Fortaleza',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function agoraIso(): string {
  return new Date().toISOString();
}

/** Remove acentos e passa para minúsculas (busca/comparação). */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function slugify(texto: string, max = 120): string {
  const s = normalizar(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');
  return s || 'item';
}

export function somenteDigitos(v: string | null | undefined): string {
  return (v ?? '').replace(/\D/g, '');
}

export function htmlParaTexto(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n- ')
    .replace(/<\/\s*(p|div|h\d|ul|ol)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function bool(v: unknown): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase();
  if (['true', '1', 'sim', 's', 'yes', 'y'].includes(s)) return true;
  if (['false', '0', 'nao', 'não', 'n', 'no'].includes(s)) return false;
  return undefined;
}

export const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
