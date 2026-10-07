import { useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { AvisoApi, Banner, Carregando, Trilha } from '../../components/Comuns';
import { NoticiaCard } from '../../components/NoticiaCard';
import { descreverVerificacao, useApi } from '../../util';

const FILTROS: [string, string][] = [
  ['todos', 'Tudo'],
  ['noticia', 'Notícias'],
  ['comunicado', 'Comunicados oficiais'],
  ['legislacao', 'Legislação'],
  ['video', 'Vídeos'],
  ['material', 'Guias e cartilhas'],
  ['prazo', 'Só o que tem prazo'],
  ['local', 'Com explicação para Canindé'],
];

export default function Noticias() {
  const [params, setParams] = useSearchParams();
  const filtro = params.get('tipo') ?? (params.get('prazo') ? 'prazo' : params.get('local') ? 'local' : 'todos');
  const noticias = useApi(() => api.noticias());
  const sinc = useApi(() => api.sincronizacao());

  const lista = (noticias.dados ?? []).filter((n) => {
    if (filtro === 'todos') return true;
    if (filtro === 'prazo') return n.temPrazo;
    if (filtro === 'local') return !!n.explicacaoLocal;
    return n.tipo === filtro;
  });

  const escolher = (f: string) => {
    const p = new URLSearchParams();
    if (f === 'prazo') p.set('prazo', 'true');
    else if (f === 'local') p.set('local', 'true');
    else if (f !== 'todos') p.set('tipo', f);
    setParams(p, { replace: true });
  };

  const verificacao = descreverVerificacao(sinc.dados?.ultimaVerificacao);

  return (
    <>
      <Banner
        icone="jornal"
        titulo="Notícias oficiais da Reforma"
        texto="Notícias, comunicados, vídeos, guias e cartilhas do Comitê Gestor do IBS, conferidos a cada 2 horas. Com a explicação da Secretaria quando o assunto afeta Canindé."
      />
      <Trilha itens={[['Início', '/'], 'Reforma Tributária', 'Notícias oficiais']} />
      <div className="filtros" role="group" aria-label="Filtrar notícias">
        {FILTROS.map(([f, rotulo]) => (
          <button key={f} className={`chip${filtro === f ? ' ativo' : ''}`} aria-pressed={filtro === f} onClick={() => escolher(f)}>
            {rotulo}
          </button>
        ))}
      </div>
      <div className="duas">
        <div className="noticias">
          {noticias.carregando && !noticias.dados ? (
            <Carregando texto="Carregando notícias…" />
          ) : noticias.erro ? (
            <AvisoApi mensagem={noticias.erro} />
          ) : lista.length === 0 ? (
            <p className="sub">Nenhuma notícia encontrada com este filtro.</p>
          ) : (
            lista.map((n) => <NoticiaCard n={n} key={n.id} />)
          )}
        </div>
        <div>
          <div className="caixa-lateral">
            {verificacao && <span className="sinc">Última verificação: {verificacao}</span>}
            <p style={{ margin: verificacao ? '8px 0 0' : 0 }}>Fontes acompanhadas:</p>
            <ul>
              <li>cgibs.gov.br — Notícias</li>
              <li>cgibs.gov.br — Comunicados oficiais</li>
              <li>cgibs.gov.br — Legislações e resoluções</li>
              <li>cgibs.gov.br — Vídeos, guias e cartilhas</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
