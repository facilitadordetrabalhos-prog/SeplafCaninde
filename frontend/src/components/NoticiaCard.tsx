import { Link } from 'react-router-dom';
import type { NoticiaOficial } from '../api';
import { formatarData, ROTULO_TIPO_NOTICIA } from '../util';
import { Externo } from './Comuns';

export function NoticiaCard({ n }: { n: NoticiaOficial }) {
  return (
    <div className="noticia">
      <div className="meta">
        <span className="tag oficial">CGIBS</span>
        <span>{ROTULO_TIPO_NOTICIA[n.tipo] ?? n.tipo}</span>
        {n.data && <span>· {formatarData(n.data)}</span>}
        {n.nova && <span className="tag erro">nova</span>}
        {n.temPrazo && <span className="tag espera">tem prazo</span>}
        {n.prazoAlterado && <span className="tag parado">prazo alterado</span>}
      </div>
      <h4>{n.titulo}</h4>
      {n.resumo && <p>{n.resumo}</p>}
      {n.explicacaoLocal && (
        <div className="local">
          <b>O que isso significa para Canindé:</b> {n.explicacaoLocal}
        </div>
      )}
      <div className="rodape">
        <Externo href={n.link}>Ler no site oficial ↗</Externo>
        {n.temPrazo && !n.prazoAlterado && <Link to="/reforma/guias/simples-puro-ou-hibrido">Guia da Secretaria</Link>}
      </div>
    </div>
  );
}
