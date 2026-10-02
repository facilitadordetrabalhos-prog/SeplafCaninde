import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { rotaDoTema } from '../util';

/** Renderiza HTML curado pela Secretaria (vindo da API). Links internos ("/rota" ou data-ir do protótipo)
    navegam sem recarregar a página; links externos abrem em nova aba. */
export function HtmlConteudo({ html, className }: { html: string; className?: string }) {
  const navigate = useNavigate();
  const clicar = (e: MouseEvent<HTMLDivElement>) => {
    const alvo = (e.target as HTMLElement).closest('a, [data-ir]') as HTMLElement | null;
    if (!alvo) return;
    const ir = alvo.getAttribute('data-ir');
    if (ir) {
      e.preventDefault();
      navigate(rotaDoTema(ir));
      return;
    }
    const href = alvo.getAttribute('href') ?? '';
    if (href.startsWith('/') && !href.startsWith('//') && !/\.(pdf|webp|png|jpe?g)$/i.test(href)) {
      e.preventDefault();
      navigate(href);
    } else if (/^https?:\/\//.test(href)) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener');
    }
  };
  return <div className={className} onClick={clicar} dangerouslySetInnerHTML={{ __html: html }} />;
}
