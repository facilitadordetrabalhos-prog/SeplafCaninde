import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Prazo } from '../api';
import { diasAte, formatarData } from '../util';

/** Quadro "Prazos que estão correndo", com contagem regressiva recalculada a cada minuto. */
export function QuadroPrazos({ prazos, erro, carregando }: { prazos: Prazo[] | null; erro: string | null; carregando: boolean }) {
  const [, setTique] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTique((x) => x + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const lista = prazos ?? [];
  const fonte = lista.find((p) => p.fonte)?.fonte;

  return (
    <div className="prazos">
      <div className="prazos-cab">
        <h3>⏰ Prazos que estão correndo</h3>
        {fonte && (
          <Link className="tag oficial" to="/reforma/noticias" style={{ whiteSpace: 'normal' }}>
            Fonte: {fonte}
          </Link>
        )}
      </div>
      {carregando && !prazos ? (
        <p className="carregando">Carregando prazos…</p>
      ) : erro ? (
        <p className="sub" style={{ margin: 0 }}>
          Não foi possível carregar os prazos agora. Consulte o <Link to="/reforma/cronograma" style={{ color: 'var(--laranja)', fontWeight: 600 }}>cronograma</Link>.
        </p>
      ) : lista.length === 0 ? (
        <p className="sub" style={{ margin: 0 }}>Nenhum prazo em aberto no momento.</p>
      ) : (
        <div className="prazos-grade">
          {lista.map((p) => {
            const dias = diasAte(p.ate);
            return (
              <div className="prazo" key={p.id}>
                {dias === null || dias < 0 ? (
                  <div className="dias fim">encerrado</div>
                ) : dias === 0 ? (
                  <div className="dias">é hoje</div>
                ) : (
                  <div className="dias">
                    {dias} <small>dia{dias > 1 ? 's' : ''} restantes</small>
                  </div>
                )}
                <h4>{p.titulo}</h4>
                <p>
                  até {formatarData(p.ate)}
                  {p.quem ? ` · ${p.quem}` : ''}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
