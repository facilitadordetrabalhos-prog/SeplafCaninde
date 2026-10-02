import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icone } from './Icones';

export function Banner({
  titulo,
  texto,
  icone,
  variante,
  selo,
  children,
}: {
  titulo: ReactNode;
  texto?: ReactNode;
  icone?: string;
  variante?: 'nfse' | 'escuro';
  selo?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`banner${variante ? ' ' + variante : ''}`}>
      {icone && <Icone nome={icone} className="icone" cor="#fff" traco={1.6} />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {selo && <span className="selo-nfse">{selo}</span>}
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
        {children}
      </div>
    </div>
  );
}

export function Trilha({ itens }: { itens: (string | [string, string])[] }) {
  const ultimo = itens.length - 1;
  return (
    <div className="trilha">
      {itens.map((it, i) => {
        const rotulo = Array.isArray(it) ? it[0] : it;
        const conteudo = i === ultimo ? <b>{rotulo}</b> : Array.isArray(it) ? <Link to={it[1]}>{rotulo}</Link> : rotulo;
        return (
          <span key={i}>
            {conteudo}
            {i < ultimo ? ' › ' : ''}
          </span>
        );
      })}
    </div>
  );
}

/** Link para site externo: sempre em nova aba, com rel="noopener". */
export function Externo({
  href,
  children,
  className,
  style,
  title,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} title={title}>
      {children}
    </a>
  );
}

export function AvisoApi({ mensagem, children }: { mensagem?: string | null; children?: ReactNode }) {
  return (
    <div className="aviso-api" role="status">
      {children ?? (
        <>
          Não foi possível carregar estas informações agora{mensagem ? ` (${mensagem})` : ''}. Tente novamente em alguns minutos.
        </>
      )}
    </div>
  );
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return <p className="carregando">{texto}</p>;
}
