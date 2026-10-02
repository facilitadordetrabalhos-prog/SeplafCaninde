import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Perfil } from '../api';
import { useAuth } from '../components/AuthContext';

interface ItemEquipe {
  rota: string;
  rotulo: string;
  perfis?: Perfil[];
}

const SECOES: { rotulo?: string; itens: ItemEquipe[] }[] = [
  { itens: [{ rota: '/equipe', rotulo: 'Painel' }] },
  { rotulo: 'Fontes oficiais', itens: [{ rota: '/equipe/monitor', rotulo: 'Monitor CGIBS', perfis: ['gestor', 'editor'] }] },
  { rotulo: 'NFS-e Nacional', itens: [{ rota: '/equipe/nfse', rotulo: 'Migração dos prestadores' }] },
  {
    rotulo: 'Atendimento',
    itens: [
      { rota: '/equipe/duvidas', rotulo: 'Caixa de dúvidas' },
      { rota: '/equipe/eventos', rotulo: 'Dúvidas do Conexão Empresarial' },
    ],
  },
  {
    rotulo: 'Conteúdo',
    itens: [
      { rota: '/equipe/conteudo', rotulo: 'Publicar conteúdo', perfis: ['gestor', 'editor'] },
      { rota: '/equipe/prazos', rotulo: 'Prazos', perfis: ['gestor', 'editor'] },
    ],
  },
  {
    rotulo: 'Administração',
    itens: [
      { rota: '/equipe/servicos', rotulo: 'Serviços online', perfis: ['gestor'] },
      { rota: '/equipe/modulos', rotulo: 'Módulos do portal', perfis: ['gestor'] },
      { rota: '/equipe/configuracoes', rotulo: 'Configurações', perfis: ['gestor'] },
      { rota: '/equipe/usuarios', rotulo: 'Usuários e perfis', perfis: ['gestor'] },
    ],
  },
];

const NOME_PERFIL: Record<Perfil, string> = { gestor: 'Gestor', editor: 'Editor', equipe: 'Equipe técnica' };

/** Bloqueia a página para perfis sem permissão (o backend também confere). */
export function SoPara({ perfis, children }: { perfis: Perfil[]; children: ReactNode }) {
  const { usuario } = useAuth();
  if (usuario && !perfis.includes(usuario.perfil)) {
    return (
      <div className="painel">
        <h3>Acesso restrito</h3>
        <p className="sub" style={{ margin: 0 }}>
          Esta área é exclusiva para o perfil {perfis.map((p) => NOME_PERFIL[p]).join(' ou ')}.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function EquipeLayout() {
  const { autenticado, usuario, sair } = useAuth();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => setMenuAberto(false), [pathname]);

  if (!autenticado) return <Navigate to="/equipe/login" replace state={{ de: pathname }} />;

  const visivel = (i: ItemEquipe) => !i.perfis || (usuario ? i.perfis.includes(usuario.perfil) : false);

  return (
    <>
      <header className="topo equipe">
        <div className="topo-esq">
          <button className="btn-menu" aria-label="Abrir menu" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            ☰
          </button>
          <Link to="/equipe" className="marca">
            <span>
              Seplaf Canindé <small>· Área da equipe</small>
            </span>
          </Link>
        </div>
        <div className="topo-acoes">
          {usuario && (
            <span className="link" title={usuario.email}>
              {usuario.nome}
            </span>
          )}
          <Link className="cracha equipe" to="/">
            ver portal
          </Link>
          <button className="cracha sair" style={{ border: 0 }} onClick={sair}>
            Sair
          </button>
        </div>
      </header>
      <div className="estrutura">
        <nav className={`lateral${menuAberto ? ' aberta' : ''}`} aria-label="Menu da equipe">
          <div className="menu">
            {SECOES.map((s, i) => {
              const itens = s.itens.filter(visivel);
              if (!itens.length) return null;
              return (
                <div key={i} style={{ display: 'contents' }}>
                  {s.rotulo && <div className="rotulo">{s.rotulo}</div>}
                  {itens.map((it) => {
                    const ativo = it.rota === '/equipe' ? pathname === '/equipe' || pathname === '/equipe/' : pathname.startsWith(it.rota);
                    return (
                      <Link key={it.rota} to={it.rota} className={ativo ? 'ativo' : undefined} aria-current={ativo ? 'page' : undefined}>
                        {it.rotulo}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </nav>
        {menuAberto && <div aria-hidden="true" onClick={() => setMenuAberto(false)} style={{ position: 'fixed', inset: 0, zIndex: 55 }} />}
        <main className="conteudo">
          <Outlet />
        </main>
      </div>
    </>
  );
}
