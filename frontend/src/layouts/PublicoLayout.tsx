import { useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useConfig } from '../components/ConfigContext';
import { Externo } from '../components/Comuns';
import { EVENTO_PADRAO_SLUG } from '../conteudo/configPadrao';
import { URLS } from '../conteudo/links';

/** Item de menu com regra de "ativo" própria (considera ?busca e prefixos). */
function ItemMenu({
  to,
  children,
  prefixo,
  semAtivo,
  style,
}: {
  to: string;
  children: ReactNode;
  prefixo?: string;
  semAtivo?: boolean;
  style?: React.CSSProperties;
}) {
  const { pathname, search } = useLocation();
  const [caminho, resto] = to.split('?');
  const caminhoSemHash = caminho.split('#')[0];
  let ativo = false;
  if (!semAtivo) {
    if (prefixo) ativo = pathname.startsWith(prefixo);
    else if (resto) ativo = pathname === caminhoSemHash && search === `?${resto}`;
    else ativo = pathname === caminhoSemHash && !search.includes('tipo=legislacao');
  }
  return (
    <Link to={to} className={ativo ? 'ativo' : undefined} aria-current={ativo ? 'page' : undefined} style={style}>
      {children}
    </Link>
  );
}

function MenuCidadao({ eventoSlug }: { eventoSlug: string }) {
  const { config, moduloAtivo } = useConfig();
  const reforma = moduloAtivo('reforma');
  const noticias = moduloAtivo('noticias-cgibs');
  const duvidas = moduloAtivo('duvidas');
  return (
    <div className="menu">
      <ItemMenu to="/">Início</ItemMenu>
      {(reforma || noticias) && <div className="rotulo">Reforma Tributária</div>}
      {noticias && <ItemMenu to="/reforma/noticias">Notícias oficiais</ItemMenu>}
      {reforma && (
        <>
          <ItemMenu to="/reforma/entenda">Entenda a reforma</ItemMenu>
          <ItemMenu to="/reforma/guias/simples-puro-ou-hibrido" prefixo="/reforma/guias/">
            Guias e dicas
          </ItemMenu>
          <ItemMenu to="/reforma/cronograma">Cronograma e prazos</ItemMenu>
          <ItemMenu to="/reforma/perguntas">Perguntas frequentes</ItemMenu>
          <ItemMenu to="/reforma/videos">Vídeos e materiais</ItemMenu>
        </>
      )}
      {noticias && <ItemMenu to="/reforma/noticias?tipo=legislacao">Legislação</ItemMenu>}
      {moduloAtivo('nfse') && (
        <>
          <div className="rotulo">Nota fiscal de serviço</div>
          <ItemMenu to="/nfse">
            NFS-e Nacional <span className="novo">novo</span>
          </ItemMenu>
        </>
      )}
      {(duvidas || moduloAtivo('eventos')) && <div className="rotulo">Fale com a Secretaria</div>}
      {duvidas && (
        <>
          <ItemMenu to="/reforma/perguntas#enviar-duvida" semAtivo>
            Enviar uma dúvida
          </ItemMenu>
          <ItemMenu to="/reforma/perguntas#protocolo" semAtivo>
            Acompanhar minha dúvida
          </ItemMenu>
        </>
      )}
      {moduloAtivo('eventos') && <ItemMenu to={`/eventos/${eventoSlug}`} prefixo="/eventos/">Conexão Empresarial: respostas</ItemMenu>}
      {moduloAtivo('servicos') && (
        <>
          <div className="rotulo">Serviços online</div>
          <Externo href={config.nfse.issMunicipalUrl}>Emitir nota fiscal (ISS) ↗</Externo>
          <Externo href={URLS.iptu}>2ª via do IPTU ↗</Externo>
          <Externo href={URLS.certidao}>Certidão da empresa ↗</Externo>
          <Externo href={config.contatos.portalServicosUrl}>Débitos e guias (DAM) ↗</Externo>
          <ItemMenu to="/servicos">Todos os serviços e contatos</ItemMenu>
        </>
      )}
    </div>
  );
}

function MenuNfse() {
  const { config } = useConfig();
  return (
    <div className="menu" id="menu-nfse">
      <div className="menu-nfse-cab">
        <small>AMBIENTE</small>
        <b>NFS-e Nacional</b>
        <Link to="/">← voltar ao portal</Link>
      </div>
      <ItemMenu to="/nfse">Comece aqui</ItemMenu>
      <Externo href={config.nfse.emissorUrl} style={{ fontWeight: 700 }}>
        Acessar o Emissor Nacional ↗
      </Externo>
      <div className="rotulo">Passo a passo</div>
      <ItemMenu to="/nfse/primeiro-acesso">1. Primeiro acesso</ItemMenu>
      <ItemMenu to="/nfse/emitir">2. Emitir a nota</ItemMenu>
      <ItemMenu to="/nfse/guia-ilustrado">📷 Guia ilustrado (tela por tela)</ItemMenu>
      <ItemMenu to="/nfse/depois-de-emitir">3. Depois de emitir</ItemMenu>
      <div className="rotulo">Ajuda</div>
      <ItemMenu to="/nfse/problemas">Problemas comuns</ItemMenu>
      <ItemMenu to="/nfse/materiais">Vídeos, guias e oficinas</ItemMenu>
    </div>
  );
}

function Rodape() {
  const { config } = useConfig();
  const c = config.contatos;
  const portalSemProtocolo = c.portalServicosUrl.replace(/^https?:\/\//, '');
  return (
    <footer className="rodape-site">
      <div className="colunas">
        <img src="/img/logo-prefeitura.webp" alt="Prefeitura Municipal de Canindé — O trabalho que transforma" />
        <div>
          <h5>Atendimento presencial</h5>
          <p>
            <b>{c.orgao}</b> · atendimento {c.horario}
            <br />
            {c.endereco}
            <br />
            <Externo href={c.mapaUrl}>Ver no mapa ↗</Externo>
          </p>
        </div>
        <div>
          <h5>Atendimento digital</h5>
          <p>
            E-mail: <a href={`mailto:${c.email}`}>{c.email}</a>
            <br />
            Telefone: <a href={c.telefoneLink}>{c.telefone}</a>
            <br />
            Portal de Serviços: <Externo href={c.portalServicosUrl}>{portalSemProtocolo} ↗</Externo>
          </p>
          <p style={{ fontSize: 12 }}>Fontes oficiais da reforma: cgibs.gov.br · gov.br/receitafederal</p>
        </div>
      </div>
      <div className="faixa-rodape" aria-hidden="true" />
    </footer>
  );
}

export default function PublicoLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [eventoSlug, setEventoSlug] = useState(EVENTO_PADRAO_SLUG);
  const nfse = pathname === '/nfse' || pathname.startsWith('/nfse/');

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuAberto) return;
    const fechar = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAberto(false);
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [menuAberto]);

  useEffect(() => {
    api
      .eventos()
      .then((l) => {
        if (Array.isArray(l) && l[0]?.slug) setEventoSlug(l[0].slug);
      })
      .catch(() => undefined);
  }, []);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const t = busca.trim();
    navigate(t ? `/reforma/perguntas?q=${encodeURIComponent(t)}` : '/reforma/perguntas');
  };

  return (
    <>
      <div className="faixa-topo" aria-hidden="true" />
      <header className="topo">
        <div className="topo-esq">
          <button className="btn-menu" aria-label="Abrir menu" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            ☰
          </button>
          <Link to="/" aria-label="Página inicial">
            <img src="/img/logo-secretaria.webp" alt="Prefeitura Municipal de Canindé — Secretaria de Finanças" />
          </Link>
        </div>
        <div className="topo-acoes">
          <Link className="cracha" to="/equipe/login">
            Área da equipe
          </Link>
        </div>
      </header>

      <div className="estrutura">
        <nav className={`lateral${menuAberto ? ' aberta' : ''}`} aria-label="Menu principal">
          {!nfse && (
            <form className="busca" role="search" onSubmit={buscar}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input placeholder="Buscar no portal" aria-label="Buscar no portal" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </form>
          )}
          {nfse ? <MenuNfse /> : <MenuCidadao eventoSlug={eventoSlug} />}
        </nav>
        {menuAberto && (
          <div
            aria-hidden="true"
            onClick={() => setMenuAberto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 55 }}
          />
        )}
        <main className="conteudo">
          <Outlet />
        </main>
      </div>

      <Rodape />
    </>
  );
}
