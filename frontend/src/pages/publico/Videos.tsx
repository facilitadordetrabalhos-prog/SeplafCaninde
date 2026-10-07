import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Banner, Externo, Trilha } from '../../components/Comuns';
import { NoticiaCard } from '../../components/NoticiaCard';
import { useApi } from '../../util';
import { VideoCard } from '../../components/Yt';
import { PDF_EBOOK_SEBRAE, PDF_GUIA_OFICIAL } from '../../conteudo/links';

type Cat = 'palestra' | 'cgibs' | 'mei' | 'pdf';

interface Item {
  cats: Cat[];
  thumb: ReactNode;
  titulo: string;
  meta: ReactNode;
  destino: { rota?: string; externo?: string; pdf?: string };
}

const ITENS: Item[] = [
  {
    cats: ['palestra', 'mei'],
    thumb: (
      <div className="thumb slide">
        <div>
          <b>
            REFORMA TRIBUTÁRIA
            <br />
            PARA EMPRESÁRIOS
          </b>
          <br />
          <small>MEI e Simples Nacional</small>
        </div>
        <span className="dur">guia</span>
      </div>
    ),
    titulo: 'Palestra: impactos, riscos e decisões para MEI e Simples Nacional',
    meta: (
      <>
        <span className="tag lar">Palestra em Canindé</span>Prof. Tiago Emerson · conteúdo no guia da Secretaria
      </>
    ),
    destino: { rota: '/reforma/guias/simples-puro-ou-hibrido' },
  },
  {
    cats: ['cgibs'],
    thumb: (
      <div className="thumb" style={{ background: 'linear-gradient(135deg,#1d5fa8,#3b82c4)' }}>
        <span className="fonte">CGIBS</span>
        <div className="play">▶</div>
        <span className="dur">vídeo oficial</span>
      </div>
    ),
    titulo: 'Vídeos do Comitê Gestor do IBS',
    meta: (
      <>
        <span className="tag oficial">Oficial</span>cgibs.gov.br
      </>
    ),
    destino: { externo: 'https://www.cgibs.gov.br/central-de-conteudo' },
  },
  {
    cats: ['mei'],
    thumb: (
      <div className="thumb" style={{ background: 'linear-gradient(135deg,#1d1d1b,#3a332a)' }}>
        <div className="play">▶</div>
        <span className="dur">3 vídeos</span>
      </div>
    ),
    titulo: 'NFS-e padrão nacional, passo a passo',
    meta: <span className="tag lar">Prestador de serviço</span>,
    destino: { rota: '/nfse' },
  },
  {
    cats: ['pdf'],
    thumb: (
      <div className="thumb" style={{ background: 'linear-gradient(135deg,#1e6b34,#2f8f4b)' }}>
        <div className="play" style={{ borderRadius: 8 }}>
          PDF
        </div>
      </div>
    ),
    titulo: 'Guia do Emissor Público Nacional Web — v1.2',
    meta: (
      <>
        <span className="tag oficial">Oficial</span>Sistema Nacional NFS-e · guia em PDF
      </>
    ),
    destino: { pdf: PDF_GUIA_OFICIAL },
  },
  {
    cats: ['pdf', 'mei'],
    thumb: (
      <div className="thumb" style={{ background: 'linear-gradient(135deg,#9a4a00,#e86f00)' }}>
        <div className="play" style={{ borderRadius: 8 }}>
          PDF
        </div>
      </div>
    ),
    titulo: 'Passo a passo: cadastramento e emissão de NFS-e',
    meta: (
      <>
        <span className="tag oficial">Sebrae / Receita</span>e-book · foco no MEI
      </>
    ),
    destino: { pdf: PDF_EBOOK_SEBRAE },
  },
];

const FILTROS: [string, string][] = [
  ['todos', 'Tudo'],
  ['palestra', 'Palestras em Canindé'],
  ['cgibs', 'Oficiais do CGIBS'],
  ['mei', 'MEI / Simples'],
  ['pdf', 'Cartilhas (PDF)'],
];

function Cartao({ item }: { item: Item }) {
  const corpo = (
    <>
      {item.thumb}
      <div className="info">
        <h4>{item.titulo}</h4>
        <div className="meta">{item.meta}</div>
      </div>
    </>
  );
  if (item.destino.rota)
    return (
      <Link className="video" to={item.destino.rota}>
        {corpo}
      </Link>
    );
  if (item.destino.externo)
    return (
      <Externo className="video" href={item.destino.externo}>
        {corpo}
      </Externo>
    );
  return (
    <a className="video" href={item.destino.pdf} target="_blank" rel="noopener">
      {corpo}
    </a>
  );
}

export default function Videos() {
  const [filtro, setFiltro] = useState('todos');
  const doCgibs = useApi(() => api.noticias({ tipo: 'video,material' }));
  const listaCgibs = (doCgibs.dados ?? []).filter((n) => filtro === 'todos' || (filtro === 'cgibs' ? true : filtro === 'pdf' && n.tipo === 'material'));
  const lista = ITENS.filter((i) => filtro === 'todos' || i.cats.includes(filtro as Cat));
  return (
    <>
      <Banner
        icone="video"
        titulo="Vídeos e materiais"
        texto="Vídeos do Sebrae e do Comitê Gestor do IBS, guias e cartilhas oficiais e o material da palestra realizada em Canindé."
      />
      <Trilha itens={[['Início', '/'], 'Reforma Tributária', 'Vídeos e materiais']} />
      <div className="filtros" role="group" aria-label="Filtrar materiais">
        {FILTROS.map(([f, r]) => (
          <button key={f} className={`chip${filtro === f ? ' ativo' : ''}`} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
            {r}
          </button>
        ))}
      </div>
      {(filtro === 'todos' || filtro === 'mei') && (
        <div className="video-lado" style={{ marginBottom: 16, alignItems: 'start' }}>
          <VideoCard id="q9dshko5nCA" titulo="Reforma Tributária 2026: boatos que estão tirando nosso sossego" meta="vídeo do Sebrae" />
          <div className="caixa-lateral" style={{ margin: 0 }}>
            <span className="tag lar">Comece por aqui</span>
            <h4 style={{ margin: '8px 0 6px' }}>Quer entender a reforma com calma?</h4>
            <p style={{ margin: '0 0 10px' }}>
              O guia “Entenda a reforma” explica IBS, CBS, cobrança no destino, cashback e a transição, com a base legal de cada ponto.
            </p>
            <Link className="botao peq" to="/reforma/entenda">
              Entender a reforma
            </Link>
          </div>
        </div>
      )}
      <div className="videos">
        {lista.map((i) => (
          <Cartao item={i} key={i.titulo} />
        ))}
      </div>
      {listaCgibs.length > 0 && (
        <>
          <h2 className="secao">Publicados pelo Comitê Gestor do IBS</h2>
          <p className="sub">Vídeos, guias e cartilhas do site oficial cgibs.gov.br, atualizados automaticamente.</p>
          <div className="noticias">
            {listaCgibs.map((n) => (
              <NoticiaCard n={n} key={n.id} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
