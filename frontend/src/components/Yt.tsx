import { useState } from 'react';

/** Vídeo do YouTube que só carrega o player (youtube-nocookie) ao clicar. */
export function Yt({ id, ord, autoplay = false, rotulo = 'Vídeo' }: { id: string; ord?: string; autoplay?: boolean; rotulo?: string }) {
  const [tocando, setTocando] = useState(autoplay);
  return (
    <div
      className="yt"
      role={tocando ? undefined : 'button'}
      tabIndex={tocando ? undefined : 0}
      aria-label={tocando ? undefined : `Reproduzir vídeo: ${rotulo}`}
      style={{ backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)` }}
      onClick={() => setTocando(true)}
      onKeyDown={(e) => {
        if (!tocando && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setTocando(true);
        }
      }}
    >
      {tocando ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={rotulo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {ord && <span className="ord">{ord}</span>}
          <span className="play">▶</span>
        </>
      )}
    </div>
  );
}

export function VideoCard({ id, titulo, fonte = 'Sebrae', meta, ord }: { id: string; titulo: string; fonte?: string; meta?: string; ord?: string }) {
  return (
    <div className="video-card">
      <Yt id={id} ord={ord} rotulo={titulo} />
      <div className="info">
        <h4>{titulo}</h4>
        <div className="meta">
          <span className="tag oficial">{fonte}</span>
          {meta}
        </div>
      </div>
    </div>
  );
}
