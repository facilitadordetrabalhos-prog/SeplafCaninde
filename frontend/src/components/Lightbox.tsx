import { useEffect, useRef } from 'react';

/** Imagem ampliada em tela cheia. Fecha com clique, botão ou tecla Esc. */
export function Lightbox({ src, legenda, aoFechar }: { src: string | null; legenda: string; aoFechar: () => void }) {
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!src) return;
    const anterior = document.activeElement as HTMLElement | null;
    botao.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    document.addEventListener('keydown', tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [src, aoFechar]);

  if (!src) return null;
  return (
    <div className="zoom aberto" role="dialog" aria-modal="true" aria-label={legenda || 'Imagem ampliada'} onClick={aoFechar}>
      <img src={src} alt={legenda} />
      <button ref={botao} type="button" className="fechar" onClick={aoFechar}>
        ✕ fechar
      </button>
      {legenda && <p>{legenda}</p>}
    </div>
  );
}
